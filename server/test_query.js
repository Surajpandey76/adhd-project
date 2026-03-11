require('dotenv').config();
const { pool } = require('./src/database');

async function testQuery() {
  try {
    const query = `
      SELECT 
        u.id, u.name, u.email, u.level, u.xp,
        (SELECT t.goal FROM tasks t WHERE t.user_id = u.id AND t.status = 'active' LIMIT 1) as active_task,
        (SELECT fs.id FROM focus_sessions fs WHERE fs.user_id = u.id AND fs.completed = false LIMIT 1) as active_session
      FROM users u
    `;
    const res = await pool.query(query);
    console.log("Success:", res.rows);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    pool.end();
  }
}

testQuery();
