require('dotenv').config();
const { pool, initDB } = require('./src/database');

async function resetDB() {
  try {
    await pool.query(`
      DROP TABLE IF EXISTS activity_log CASCADE;
      DROP TABLE IF EXISTS rewards CASCADE;
      DROP TABLE IF EXISTS focus_sessions CASCADE;
      DROP TABLE IF EXISTS subtasks CASCADE;
      DROP TABLE IF EXISTS tasks CASCADE;
      DROP TABLE IF EXISTS otps CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    console.log("All tables dropped.");
    await initDB();
    console.log("DB Reinitialized with correct schema.");
  } catch (err) {
    console.error("Error resetting DB:", err);
  } finally {
    pool.end();
  }
}

resetDB();
