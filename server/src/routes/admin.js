const express = require('express');
const { readDB } = require('../database');
const { sendNotificationToUser } = require('./notifications');
// Usually we'd check for admin rights here, but for simplicity we'll just allow it or use a basic check.
// We can define a hardcoded admin pass or just allow any authenticated user for this prototype.
// For now, let's keep it simple and unprotected or use a basic token header if needed.

const router = express.Router();

// Dummy middleware for admin access (in a real app, verify user is admin)
const requireAdmin = (req, res, next) => {
  // Let's assume the request has some admin-secret header or we just pass it through for the prototype.
  next();
};

// GET /api/admin/users
router.get('/users', requireAdmin, (req, res) => {
  try {
    const db = readDB();
    
    // Map users to include their current status (active goal/focus session)
    const usersWithStatus = db.users.map(u => {
      // Is user focusing?
      const activeSession = db.focusSessions.find(s => s.userId === u.id && !s.completed);
      // Is user working on a task?
      const activeTask = db.tasks.find(t => t.userId === u.id && t.status === 'active');
      
      let currentActivity = 'Idle';
      if (activeSession) {
        currentActivity = 'In Focus Session';
      } else if (activeTask) {
        currentActivity = `Goal: ${activeTask.goal}`;
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

module.exports = router;
