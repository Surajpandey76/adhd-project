const express = require('express');
const { readDB, writeDB, generateId } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/tasks — all tasks for current user
router.get('/', authenticateToken, (req, res) => {
  const db = readDB();
  const tasks = db.tasks.filter(t => t.userId === req.user.id);
  const tasksWithSubtasks = tasks.map(task => {
    const subtasks = db.subtasks
      .filter(s => s.taskId === task.id)
      .sort((a, b) => a.order - b.order);
    const completedCount = subtasks.filter(s => s.status === 'completed').length;
    return { ...task, subtasks, completedCount, totalCount: subtasks.length };
  });
  res.json(tasksWithSubtasks);
});

// POST /api/tasks — create a new task/goal
router.post('/', authenticateToken, (req, res) => {
  const { goal } = req.body;
  if (!goal) return res.status(400).json({ error: 'Goal is required' });

  const db = readDB();
  const task = {
    id: generateId(),
    userId: req.user.id,
    goal,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  db.tasks.push(task);
  writeDB(db);
  res.status(201).json(task);
});

// PUT /api/tasks/:id
router.put('/:id', authenticateToken, (req, res) => {
  const db = readDB();
  const task = db.tasks.find(t => t.id === req.params.id && t.userId === req.user.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  if (req.body.goal) task.goal = req.body.goal;
  if (req.body.status) task.status = req.body.status;
  writeDB(db);
  res.json(task);
});

// DELETE /api/tasks/:id
router.delete('/:id', authenticateToken, (req, res) => {
  const db = readDB();
  const idx = db.tasks.findIndex(t => t.id === req.params.id && t.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });

  const taskId = db.tasks[idx].id;
  db.tasks.splice(idx, 1);
  db.subtasks = db.subtasks.filter(s => s.taskId !== taskId);
  writeDB(db);
  res.json({ success: true });
});

// POST /api/tasks/:id/subtasks — add subtasks to a task
router.post('/:id/subtasks', authenticateToken, (req, res) => {
  const { subtasks } = req.body; // array of { title }
  if (!subtasks || !Array.isArray(subtasks)) {
    return res.status(400).json({ error: 'Subtasks array required' });
  }

  const db = readDB();
  const task = db.tasks.find(t => t.id === req.params.id && t.userId === req.user.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const existingCount = db.subtasks.filter(s => s.taskId === task.id).length;
  const newSubtasks = subtasks.map((s, i) => ({
    id: generateId(),
    taskId: task.id,
    title: s.title || s,
    status: 'pending',
    order: existingCount + i + 1,
  }));

  db.subtasks.push(...newSubtasks);
  writeDB(db);
  res.status(201).json(newSubtasks);
});

// PUT /api/subtasks/:id/complete — mark subtask as completed
router.put('/subtasks/:id/complete', authenticateToken, (req, res) => {
  const db = readDB();
  const subtask = db.subtasks.find(s => s.id === req.params.id);
  if (!subtask) return res.status(404).json({ error: 'Subtask not found' });

  const task = db.tasks.find(t => t.id === subtask.taskId && t.userId === req.user.id);
  if (!task) return res.status(403).json({ error: 'Unauthorized' });

  subtask.status = 'completed';

  // Award XP and coins
  const user = db.users.find(u => u.id === req.user.id);
  const xpEarned = 25;
  const coinsEarned = 10;
  user.xp += xpEarned;
  user.coins += coinsEarned;

  // Level up every 200 XP
  const newLevel = Math.floor(user.xp / 200) + 1;
  const leveledUp = newLevel > user.level;
  user.level = newLevel;

  // Record reward
  db.rewards.push({
    id: generateId(),
    userId: user.id,
    xp: xpEarned,
    coins: coinsEarned,
    source: 'subtask_complete',
    createdAt: new Date().toISOString(),
  });

  // Check if all subtasks done
  const allSubtasks = db.subtasks.filter(s => s.taskId === task.id);
  const allDone = allSubtasks.every(s => s.status === 'completed');
  if (allDone) {
    task.status = 'completed';
    // Bonus for completing entire goal
    user.xp += 100;
    user.coins += 50;
    user.level = Math.floor(user.xp / 200) + 1;
    db.rewards.push({
      id: generateId(),
      userId: user.id,
      xp: 100,
      coins: 50,
      source: 'goal_complete',
      createdAt: new Date().toISOString(),
    });
  }

  writeDB(db);

  const { password: _, ...userWithoutPassword } = user;
  res.json({
    subtask,
    goalCompleted: allDone,
    leveledUp,
    xpEarned: allDone ? xpEarned + 100 : xpEarned,
    coinsEarned: allDone ? coinsEarned + 50 : coinsEarned,
    user: userWithoutPassword,
  });
});

module.exports = router;
