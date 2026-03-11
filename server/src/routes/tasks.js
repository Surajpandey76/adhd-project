const express = require('express');
const { pool } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Helper to map snake_case to camelCase
const toCamel = (row) => {
  const newRow = { ...row };
  if (newRow.user_id) { newRow.userId = newRow.user_id; delete newRow.user_id; }
  if (newRow.task_id) { newRow.taskId = newRow.task_id; delete newRow.task_id; }
  if (newRow.created_at) { newRow.createdAt = newRow.created_at; delete newRow.created_at; }
  if (newRow.order_num !== undefined) { newRow.order = newRow.order_num; delete newRow.order_num; }
  return newRow;
};

// GET /api/tasks — all tasks for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const tasksRes = await pool.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    const tasks = tasksRes.rows.map(toCamel);

    if (tasks.length === 0) return res.json([]);

    const taskIds = tasks.map(t => t.id);
    const subtasksRes = await pool.query(
      'SELECT * FROM subtasks WHERE task_id = ANY($1::uuid[]) ORDER BY order_num ASC', 
      [taskIds]
    );
    const allSubtasks = subtasksRes.rows.map(toCamel);

    const tasksWithSubtasks = tasks.map(task => {
      const subtasks = allSubtasks.filter(s => s.taskId === task.id);
      const completedCount = subtasks.filter(s => s.status === 'completed').length;
      return { ...task, subtasks, completedCount, totalCount: subtasks.length };
    });

    res.json(tasksWithSubtasks);
  } catch (err) {
    console.error('GET tasks error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tasks — create a new task/goal
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal) return res.status(400).json({ error: 'Goal is required' });

    const result = await pool.query(
      'INSERT INTO tasks (user_id, goal, status) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, goal, 'active']
    );
    res.status(201).json(toCamel(result.rows[0]));
  } catch (err) {
    console.error('POST tasks error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/tasks/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { goal, status } = req.body;
    const taskRes = await pool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (taskRes.rows.length === 0) return res.status(404).json({ error: 'Task not found' });

    const updateFields = [];
    const values = [];
    let idx = 1;
    if (goal !== undefined) { updateFields.push(`goal = $${idx++}`); values.push(goal); }
    if (status !== undefined) { updateFields.push(`status = $${idx++}`); values.push(status); }

    if (updateFields.length === 0) return res.json(toCamel(taskRes.rows[0]));

    values.push(req.params.id, req.user.id);
    const result = await pool.query(
      `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = $${idx} AND user_id = $${idx+1} RETURNING *`,
      values
    );
    res.json(toCamel(result.rows[0]));
  } catch (err) {
    console.error('PUT tasks error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.user.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE tasks error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tasks/:id/subtasks — add subtasks to a task
router.post('/:id/subtasks', authenticateToken, async (req, res) => {
  try {
    const { subtasks } = req.body; // array of { title }
    if (!subtasks || !Array.isArray(subtasks)) {
      return res.status(400).json({ error: 'Subtasks array required' });
    }

    const taskRes = await pool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (taskRes.rows.length === 0) return res.status(404).json({ error: 'Task not found' });

    const countRes = await pool.query('SELECT COUNT(*) FROM subtasks WHERE task_id = $1', [req.params.id]);
    const existingCount = parseInt(countRes.rows[0].count, 10);
    
    const newSubtasks = [];
    for (let i = 0; i < subtasks.length; i++) {
      const s = subtasks[i];
      const title = s.title || s;
      const order = existingCount + i + 1;
      
      const insertRes = await pool.query(
        'INSERT INTO subtasks (task_id, user_id, title, status, order_num) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [req.params.id, req.user.id, title, 'pending', order]
      );
      newSubtasks.push(toCamel(insertRes.rows[0]));
    }

    res.status(201).json(newSubtasks);
  } catch (err) {
    console.error('POST subtasks error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/subtasks/:id/complete — mark subtask as completed
router.put('/subtasks/:id/complete', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Lock subtask & check ownership
    const subtaskRes = await client.query('SELECT * FROM subtasks WHERE id = $1 FOR UPDATE', [req.params.id]);
    if (subtaskRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Subtask not found' });
    }
    const subtask = subtaskRes.rows[0];
    
    const taskRes = await client.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [subtask.task_id, req.user.id]);
    if (taskRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const task = taskRes.rows[0];

    // Mark completed
    await client.query('UPDATE subtasks SET status = $1 WHERE id = $2', ['completed', subtask.id]);
    subtask.status = 'completed';

    // Award XP and coins
    const userRes = await client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [req.user.id]);
    const user = userRes.rows[0];
    const xpEarned = 25;
    const coinsEarned = 10;
    
    let newXp = user.xp + xpEarned;
    let newCoins = user.coins + coinsEarned;
    let newLevel = Math.floor(newXp / 200) + 1;
    let leveledUp = newLevel > user.level;

    // Log Activity XP
    await client.query('INSERT INTO activity_log (user_id, xp, coins, source) VALUES ($1, $2, $3, $4)', 
      [user.id, xpEarned, coinsEarned, 'subtask_complete']
    );

    // Check if all subtasks done
    const allSubsRes = await client.query('SELECT status FROM subtasks WHERE task_id = $1', [task.id]);
    const allDone = allSubsRes.rows.every(s => s.status === 'completed');
    
    if (allDone) {
      await client.query('UPDATE tasks SET status = $1 WHERE id = $2', ['completed', task.id]);
      task.status = 'completed';
      // Bonus
      newXp += 100;
      newCoins += 50;
      newLevel = Math.floor(newXp / 200) + 1;
      await client.query('INSERT INTO activity_log (user_id, xp, coins, source) VALUES ($1, $2, $3, $4)', 
        [user.id, 100, 50, 'goal_complete']
      );
    }

    // Save final user state
    await client.query('UPDATE users SET xp = $1, coins = $2, level = $3 WHERE id = $4', [newXp, newCoins, newLevel, user.id]);
    
    await client.query('COMMIT');

    const updatedUserRes = await pool.query('SELECT * FROM users WHERE id = $1', [user.id]);
    const updatedUser = updatedUserRes.rows[0];
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    const uiUser = { ...userWithoutPassword, lastActiveDate: updatedUser.last_active_date, createdAt: updatedUser.created_at };
    delete uiUser.last_active_date;
    delete uiUser.created_at;

    res.json({
      subtask: toCamel(subtask),
      goalCompleted: allDone,
      leveledUp,
      xpEarned: allDone ? xpEarned + 100 : xpEarned,
      coinsEarned: allDone ? coinsEarned + 50 : coinsEarned,
      user: uiUser,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Complete subtask error:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
