const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const PANIC_PLANS = {
  'too-many-tasks': {
    title: 'Too Many Tasks — Let\'s Simplify',
    steps: [
      { emoji: '🧘', action: 'Take 3 deep breaths right now. Inhale for 4 counts, hold for 4, exhale for 4.' },
      { emoji: '📝', action: 'Write down just ONE task — the smallest, easiest thing on your plate. Ignore everything else.' },
      { emoji: '⏱️', action: 'Set a 5-minute timer and work on ONLY that one task. When the timer ends, you\'re done — or keep going if you feel like it.' },
    ],
  },
  'messy-room': {
    title: 'Messy Room — Tiny Start',
    steps: [
      { emoji: '🗑️', action: 'Grab a bag and pick up just the trash — wrappers, tissues, old papers. Only trash, nothing else.' },
      { emoji: '👕', action: 'Pick up all clothes from the floor. Put them in one pile on your bed — don\'t sort them yet.' },
      { emoji: '✨', action: 'Clear off one surface completely — your desk, nightstand, or chair. Just one.' },
    ],
  },
  'deadline-stress': {
    title: 'Deadline Stress — Calm Down Plan',
    steps: [
      { emoji: '⏸️', action: 'Step away from the screen for 2 minutes. Splash cold water on your face or hold an ice cube.' },
      { emoji: '🎯', action: 'Write down what\'s actually due and when. Cross off anything that isn\'t due TODAY.' },
      { emoji: '✏️', action: 'Pick the most urgent item. Open it and write just the first sentence or line. Starting is the hardest part.' },
    ],
  },
  'studying': {
    title: 'Study Overwhelm — Micro-Study Plan',
    steps: [
      { emoji: '📖', action: 'Close all tabs and apps except your study material. Put your phone face-down.' },
      { emoji: '🔍', action: 'Pick ONE small section or concept to focus on. Read just that section — nothing else.' },
      { emoji: '✍️', action: 'Write 3 things you just learned in your own words. That\'s your study session done!' },
    ],
  },
  'general': {
    title: 'Feeling Overwhelmed — Emergency Reset',
    steps: [
      { emoji: '🫁', action: 'Do box breathing: breathe in 4 seconds, hold 4, out 4, hold 4. Repeat 3 times.' },
      { emoji: '💭', action: 'Complete this sentence out loud: "Right now, the ONE thing I can control is..."' },
      { emoji: '👣', action: 'Do that one thing for just 2 minutes. Set a timer. You can stop after 2 minutes, no guilt.' },
    ],
  },
};

// POST /api/panic
router.post('/', authenticateToken, (req, res) => {
  const { category } = req.body;
  const plan = PANIC_PLANS[category] || PANIC_PLANS['general'];
  res.json(plan);
});

// GET /api/panic/categories
router.get('/categories', (req, res) => {
  res.json([
    { id: 'too-many-tasks', label: 'Too many tasks', emoji: '📋' },
    { id: 'messy-room', label: 'Messy room', emoji: '🏠' },
    { id: 'deadline-stress', label: 'Deadline stress', emoji: '⏰' },
    { id: 'studying', label: 'Studying overwhelm', emoji: '📚' },
    { id: 'general', label: 'Something else', emoji: '😰' },
  ]);
});

module.exports = router;
