const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('../database');
const { sendNotificationToUser } = require('./notifications');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Define hardcoded credentials for prototype
const ADMIN_EMAIL = 'support.focusflow@gmail.com';
const ADMIN_PASS = 'Bhardwaj@767474';

// JWT verification middleware specifically for Admin
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) return res.status(401).json({ error: 'Access denied. No admin token provided.' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Invalid or unauthorized admin token.' });
    }
    req.admin = decoded;
    next();
  });
};

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
    // Issue a robust token for the admin with a specific role
    const token = jwt.sign({ role: 'admin', email: ADMIN_EMAIL }, JWT_SECRET, { expiresIn: '12h' });
    return res.json({ token, message: 'Admin login successful' });
  } else {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }
});

// GET /api/admin/users
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id, u.name, u.email, u.level, u.xp,
        (SELECT t.goal FROM tasks t WHERE t.user_id = u.id AND t.status = 'active' LIMIT 1) as active_task,
        (SELECT fs.id FROM focus_sessions fs WHERE fs.user_id = u.id AND fs.completed = false LIMIT 1) as active_session
      FROM users u
    `;
    
    const usersRes = await pool.query(query);

    const usersWithStatus = usersRes.rows.map(u => {
      let currentActivity = 'Idle';
      if (u.active_session) {
        currentActivity = 'In Focus Session';
      } else if (u.active_task) {
        currentActivity = `Goal: ${u.active_task}`;
      }

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        level: u.level,
        xp: u.xp,
        currentActivity,
      };
    });

    res.json(usersWithStatus);
  } catch (err) {
    console.error('GET admin users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/admin/notify
router.post('/notify', requireAdmin, (req, res) => {
  try {
    const { userId, message } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }

    const sent = sendNotificationToUser(userId, {
      type: 'focus_reminder',
      message: message
    });

    if (sent) {
      res.json({ success: true, message: 'Notification sent successfully' });
    } else {
      res.status(404).json({ error: 'User is not currently connected' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Deleting the user automatically deletes their tasks, subtasks, focus_sessions, rewards, and activity logs
    // because of the ON DELETE CASCADE constraints configured in the PostgreSQL schema.
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('DELETE admin user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
