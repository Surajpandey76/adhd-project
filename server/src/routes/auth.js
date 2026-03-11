const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readDB, writeDB, generateId } = require('../database');
const { JWT_SECRET } = require('../middleware/auth');
const { sendEmail } = require('../utils/mailer');

const router = express.Router();

// Helper to clean up expired OTPs
const cleanupOtps = (db) => {
  const now = Date.now();
  db.otps = db.otps.filter(o => o.expiresAt > now);
};

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const otpData = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    
    const db = readDB();
    if (!db.otps) db.otps = [];
    cleanupOtps(db);
    
    // Remove existing OTP for this email
    db.otps = db.otps.filter(o => o.email !== email);
    
    // Add new OTP good for 10 minutes
    db.otps.push({
      email,
      code: otpData,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });
    writeDB(db);

    await sendEmail(
      email,
      'Your FocusFlow Verification Code',
      `Your code is: ${otpData}`,
      `<h2>FocusFlow Verification</h2><p>Your OTP code is: <strong>${otpData}</strong></p><p>It will expire in 10 minutes.</p>`
    );
    
    // Just log for ease of testing during dev so we don't have to check ethereal email every time
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

    const db = readDB();
    if (!db.otps) db.otps = [];
    cleanupOtps(db);

    // Verify OTP
    const otpRecord = db.otps.find(o => o.email === email && o.code === otp);
    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const existing = db.users.find(u => u.email === email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: generateId(),
      name,
      email,
      password: hashedPassword,
      xp: 0,
      coins: 0,
      streak: 0,
      level: 1,
      avatar: 'default',
      lastActiveDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    db.users.push(user);
    db.otps = db.otps.filter(o => o.email !== email);
    writeDB(db);

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ token, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    if (!email || !password || !otp) {
      return res.status(400).json({ error: 'Email, password, and OTP are required' });
    }

    const db = readDB();
    if (!db.otps) db.otps = [];
    cleanupOtps(db);

    // Verify OTP
    const otpRecord = db.otps.find(o => o.email === email && o.code === otp);
    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (user.lastActiveDate === yesterday) {
      user.streak += 1;
    } else if (user.lastActiveDate !== today) {
      user.streak = 1;
    }
    user.lastActiveDate = today;
    
    // Clean up used OTP
    db.otps = db.otps.filter(o => o.email !== email);
    writeDB(db);

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').authenticateToken, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

module.exports = router;
