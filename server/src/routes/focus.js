const express = require('express');
const { readDB, writeDB, generateId } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/focus/start
router.post('/start', authenticateToken, (req, res) => {
  const { taskId } = req.body;
  const db = readDB();

  const session = {
    id: generateId(),
    userId: req.user.id,
    taskId: taskId || null,
    startedAt: new Date().toISOString(),
    duration: 0,
    completed: false,
  };

  db.focusSessions.push(session);
  writeDB(db);
  res.status(201).json(session);
});

// PUT /api/focus/:id/end
router.put('/:id/end', authenticateToken, (req, res) => {
  const db = readDB();
  const session = db.focusSessions.find(s => s.id === req.params.id && s.userId === req.user.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const { duration } = req.body;
  session.duration = duration || Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);
  session.completed = true;

  // Award XP for focus time (1 XP per minute)
  const user = db.users.find(u => u.id === req.user.id);
  const minutesFocused = Math.floor(session.duration / 60);
  const xpEarned = Math.max(minutesFocused, 5);
  user.xp += xpEarned;
  user.coins += Math.floor(xpEarned / 2);
  user.level = Math.floor(user.xp / 200) + 1;

  db.rewards.push({
    id: generateId(),
    userId: user.id,
    xp: xpEarned,
    coins: Math.floor(xpEarned / 2),
    source: 'focus_session',
    createdAt: new Date().toISOString(),
  });

  writeDB(db);
  const { password: _, ...userWithoutPassword } = user;
  res.json({ session, xpEarned, user: userWithoutPassword });
});

// GET /api/focus/stats
router.get('/stats', authenticateToken, (req, res) => {
  const db = readDB();
  const sessions = db.focusSessions.filter(s => s.userId === req.user.id && s.completed);
  const totalMinutes = sessions.reduce((sum, s) => sum + Math.floor(s.duration / 60), 0);
  const totalSessions = sessions.length;

  // Last 7 days stats
  const now = new Date();
  const weekAgo = new Date(now - 7 * 86400000);
  const weeklySessions = sessions.filter(s => new Date(s.startedAt) >= weekAgo);
  const dailyStats = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now - i * 86400000);
    const dayStr = day.toISOString().split('T')[0];
    const label = day.toLocaleDateString('en', { weekday: 'short' });
    const daySessions = weeklySessions.filter(s => s.startedAt.split('T')[0] === dayStr);
    dailyStats.push({
      day: label,
      date: dayStr,
      minutes: daySessions.reduce((sum, s) => sum + Math.floor(s.duration / 60), 0),
      sessions: daySessions.length,
    });
  }

  res.json({ totalMinutes, totalSessions, dailyStats });
});

module.exports = router;
