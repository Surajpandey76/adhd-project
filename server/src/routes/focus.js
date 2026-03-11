const express = require('express');
const { pool } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Helper to map snake_case to camelCase
const toCamel = (row) => {
  const newRow = { ...row };
  if (newRow.user_id) { newRow.userId = newRow.user_id; delete newRow.user_id; }
  if (newRow.task_id) { newRow.taskId = newRow.task_id; delete newRow.task_id; }
  if (newRow.started_at) { newRow.startedAt = newRow.started_at; delete newRow.started_at; }
  return newRow;
};

// POST /api/focus/start
router.post('/start', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.body;
    
    const result = await pool.query(
      'INSERT INTO focus_sessions (user_id, task_id, duration, completed) VALUES ($1, $2, 0, false) RETURNING *',
      [req.user.id, taskId || null]
    );

    res.status(201).json(toCamel(result.rows[0]));
  } catch (err) {
    console.error('POST focus start error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/focus/:id/end
router.put('/:id/end', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { duration } = req.body;

    const sessRes = await client.query('SELECT * FROM focus_sessions WHERE id = $1 AND user_id = $2 FOR UPDATE', [req.params.id, req.user.id]);
    if (sessRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Session not found' });
    }
    const session = sessRes.rows[0];

    let calcDuration = duration;
    if (calcDuration === undefined) {
      calcDuration = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);
    }

    const updateRes = await client.query(
      'UPDATE focus_sessions SET duration = $1, completed = true WHERE id = $2 RETURNING *',
      [calcDuration, session.id]
    );
    const updatedSession = updateRes.rows[0];

    const userRes = await client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [req.user.id]);
    const user = userRes.rows[0];

    const minutesFocused = Math.floor(calcDuration / 60);
    const xpEarned = Math.max(minutesFocused, 5);
    const coinsEarned = Math.floor(xpEarned / 2);

    let newXp = user.xp + xpEarned;
    let newCoins = user.coins + coinsEarned;
    let newLevel = Math.floor(newXp / 200) + 1;

    await client.query('UPDATE users SET xp = $1, coins = $2, level = $3 WHERE id = $4', [newXp, newCoins, newLevel, user.id]);

    await client.query('INSERT INTO activity_log (user_id, xp, coins, source) VALUES ($1, $2, $3, $4)', 
      [user.id, xpEarned, coinsEarned, 'focus_session']
    );

    await client.query('COMMIT');

    const updatedUserRes = await pool.query('SELECT * FROM users WHERE id = $1', [user.id]);
    const updatedUser = updatedUserRes.rows[0];
    const { password: _, ...userWithoutPassword } = updatedUser;

    const uiUser = { ...userWithoutPassword, lastActiveDate: updatedUser.last_active_date, createdAt: updatedUser.created_at };
    delete uiUser.last_active_date;
    delete uiUser.created_at;

    res.json({ session: toCamel(updatedSession), xpEarned, user: uiUser });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('PUT focus end error:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// GET /api/focus/stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const sessRes = await pool.query('SELECT * FROM focus_sessions WHERE user_id = $1 AND completed = true', [req.user.id]);
    const sessions = sessRes.rows;

    const totalMinutes = sessions.reduce((sum, s) => sum + Math.floor(s.duration / 60), 0);
    const totalSessions = sessions.length;

    // Last 7 days stats
    const now = new Date();
    const weekAgo = new Date(now - 7 * 86400000);
    const weeklySessions = sessions.filter(s => new Date(s.started_at) >= weekAgo);
    
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now - i * 86400000);
      const dayStr = day.toISOString().split('T')[0];
      const label = day.toLocaleDateString('en', { weekday: 'short' });
      
      const daySessions = weeklySessions.filter(s => {
        const sessDate = new Date(s.started_at);
        return sessDate.toISOString().split('T')[0] === dayStr;
      });
      
      dailyStats.push({
        day: label,
        date: dayStr,
        minutes: daySessions.reduce((sum, s) => sum + Math.floor(s.duration / 60), 0),
        sessions: daySessions.length,
      });
    }

    res.json({ totalMinutes, totalSessions, dailyStats });
  } catch (err) {
    console.error('GET focus stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
