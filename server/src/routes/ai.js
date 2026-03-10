const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// The AI task breakdown engine — rule-based, no API key needed
const TASK_TEMPLATES = {
  interview: [
    'Research the company and role online for 5 minutes',
    'Read through the job description and highlight key requirements',
    'Write down 3 of your biggest strengths that match the role',
    'Prepare 2 stories using the STAR method for behavioral questions',
    'Practice answering "Tell me about yourself" out loud once',
    'Look up 3 common technical questions for this role',
    'Write short bullet-point answers for each question',
    'Pick out your interview outfit and lay it out',
    'Pack your bag with resume, notebook, and pen',
    'Set an alarm for interview day with 30 min buffer',
  ],
  clean: [
    'Pick up any trash or wrappers and throw them away',
    'Collect all dirty dishes and take them to the kitchen',
    'Pick up all clothes off the floor and sort: clean vs dirty',
    'Put dirty clothes in the hamper',
    'Fold or hang clean clothes',
    'Make your bed — just straighten the sheets and pillow',
    'Wipe down your desk or main surface',
    'Organize items on your desk into groups',
    'Sweep or vacuum the floor quickly',
    'Take out the trash bag and replace it',
  ],
  assignment: [
    'Open the assignment document and read the instructions once',
    'Highlight or write down the key requirements',
    'Create a blank document and add your name and title',
    'Write a rough outline with section headers',
    'Write the first paragraph — just get words down, don\'t edit',
    'Fill in the next section with key points',
    'Continue writing section by section (don\'t go back yet)',
    'Take a 5-minute break — stretch and drink water',
    'Read through what you wrote and fix obvious issues',
    'Add your sources and format the bibliography',
    'Do a final spell-check and submit',
  ],
  portfolio: [
    'Decide on 3-5 projects you want to showcase',
    'Write a one-line description for each project',
    'Choose a template or platform (GitHub Pages, Vercel, etc.)',
    'Set up the basic project structure',
    'Create the homepage with your name and a short bio',
    'Add the first project with screenshot and description',
    'Add remaining projects one at a time',
    'Write a short "About Me" section',
    'Add your contact information and social links',
    'Review the whole site on mobile and desktop',
    'Deploy and share the link',
  ],
  study: [
    'Gather all your study materials in one place',
    'Skim through the table of contents or topic list',
    'Pick the most important topic to start with',
    'Read or watch one section for 10 minutes',
    'Write 3 key takeaways from what you just learned',
    'Take a 5-minute break',
    'Move to the next topic and repeat',
    'Create flashcards for important terms',
    'Quiz yourself on the flashcards',
    'Review any weak areas one more time',
  ],
  exercise: [
    'Put on workout clothes and shoes',
    'Fill a water bottle',
    'Do 2 minutes of light stretching',
    'Start with a 5-minute warm-up walk or jog',
    'Do your main workout for 15-20 minutes',
    'Cool down with 5 minutes of walking',
    'Stretch for 3 minutes',
    'Drink water and log your workout',
  ],
  email: [
    'Open your inbox and scan subject lines',
    'Delete or archive junk emails first',
    'Flag emails that need a reply',
    'Reply to the easiest email first',
    'Reply to the next flagged email',
    'Continue until all flagged emails are answered',
    'Unsubscribe from one newsletter you don\'t read',
  ],
};

function findTemplate(goal) {
  const lower = goal.toLowerCase();
  if (lower.includes('interview')) return TASK_TEMPLATES.interview;
  if (lower.includes('clean') || lower.includes('room') || lower.includes('tidy')) return TASK_TEMPLATES.clean;
  if (lower.includes('assignment') || lower.includes('homework') || lower.includes('essay') || lower.includes('paper')) return TASK_TEMPLATES.assignment;
  if (lower.includes('portfolio') || lower.includes('website') || lower.includes('resume')) return TASK_TEMPLATES.portfolio;
  if (lower.includes('study') || lower.includes('exam') || lower.includes('test') || lower.includes('learn')) return TASK_TEMPLATES.study;
  if (lower.includes('exercise') || lower.includes('workout') || lower.includes('gym') || lower.includes('run')) return TASK_TEMPLATES.exercise;
  if (lower.includes('email') || lower.includes('inbox')) return TASK_TEMPLATES.email;
  return null;
}

function generateGenericSubtasks(goal) {
  return [
    `Write down exactly what "${goal}" means to you in one sentence`,
    `List 3-5 things that need to happen for "${goal}"`,
    'Pick the single easiest item from your list',
    'Spend 5 minutes working on just that one item',
    'Take a short break — you earned it',
    'Pick the next easiest item and spend 10 minutes on it',
    'Review what you\'ve done so far and adjust your list',
    'Continue with the next item for 10 minutes',
    'Take another break and check your progress',
    `Do a final review and celebrate completing "${goal}"`,
  ];
}

// POST /api/ai/breakdown
router.post('/breakdown', authenticateToken, (req, res) => {
  const { goal } = req.body;
  if (!goal) return res.status(400).json({ error: 'Goal is required' });

  const template = findTemplate(goal);
  const subtasks = template || generateGenericSubtasks(goal);

  res.json({
    goal,
    subtasks: subtasks.map((title, index) => ({
      title,
      order: index + 1,
    })),
  });
});

module.exports = router;
