const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../database');
const { JWT_SECRET } = require('../middleware/auth');
const { sendEmail } = require('../utils/mailer');

const router = express.Router();

// Helper to clean up expired OTPs
const cleanupOtps = async () => {
  const now = Date.now();
  await pool.query('DELETE FROM otps WHERE expires_at <= $1', [now]);
};

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const otpData = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    
    await cleanupOtps();
    
    // Remove existing OTP for this email
    await pool.query('DELETE FROM otps WHERE email = $1', [email]);
    
    // Add new OTP good for 10 minutes
    const expiresAt = Date.now() + 10 * 60 * 1000;
    await pool.query(
      'INSERT INTO otps (email, code, expires_at) VALUES ($1, $2, $3)', 
      [email, otpData, expiresAt]
    );

    await sendEmail(
      email,
      'Your Dopely Verification Code',
      `Your code is: ${otpData}`,
      `<h2>Dopely Verification</h2><p>Your OTP code is: <strong>${otpData}</strong></p><p>It will expire in 10 minutes.</p>`
    );
    
    console.log(`[OTP] Created OTP ${otpData} for ${email}`);

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;
    if (!name || !email || !password || !otp) {
      return res.status(400).json({ error: 'Name, email, password, and OTP are required' });
    }

    // Password validation: min 8 chars, alphanumeric mandatory
    const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!pwRegex.test(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters and include both letters and numbers.' });
    }

    await cleanupOtps();

    // Verify OTP
    const otpResult = await pool.query('SELECT * FROM otps WHERE email = $1 AND code = $2', [email, otp]);
    if (otpResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const insertResult = await pool.query(
      `INSERT INTO users (name, email, password) 
       VALUES ($1, $2, $3) RETURNING *`,
      [name, email, hashedPassword]
    );

    const user = insertResult.rows[0];
    await pool.query('DELETE FROM otps WHERE email = $1', [email]);

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user;
    
    // Map snake_case to camelCase for frontend
    const uiUser = { ...userWithoutPassword, lastActiveDate: user.last_active_date, createdAt: user.created_at };
    delete uiUser.last_active_date;
    delete uiUser.created_at;

    res.status(201).json({ token, user: uiUser });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update streak logic
    const today = new Date().toISOString().split('T')[0];
    const userLastActiveTimestamp = user.last_active_date ? new Date(user.last_active_date) : new Date();
    const userLastActiveStr = userLastActiveTimestamp.toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let newStreak = user.streak;
    if (userLastActiveStr === yesterday) {
      newStreak += 1;
    } else if (userLastActiveStr !== today) {
      newStreak = 1;
    }

    await pool.query(
      'UPDATE users SET streak = $1, last_active_date = CURRENT_DATE WHERE id = $2',
      [newStreak, user.id]
    );

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user;
    
    userWithoutPassword.streak = newStreak;
    
    // Map snake_case to camelCase
    const uiUser = { ...userWithoutPassword, lastActiveDate: user.last_active_date, createdAt: user.created_at };
    delete uiUser.last_active_date;
    delete uiUser.created_at;

    res.json({ token, user: uiUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const user = userResult.rows[0];
    const { password: _, ...userWithoutPassword } = user;
    
    // Map snake_case to camelCase
    const uiUser = { ...userWithoutPassword, lastActiveDate: user.last_active_date, createdAt: user.created_at };
    delete uiUser.last_active_date;
    delete uiUser.created_at;

    res.json(uiUser);
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
