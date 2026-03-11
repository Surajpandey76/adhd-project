const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

function getDefaultDB() {
  return {
    users: [],
    tasks: [],
    subtasks: [],
    focusSessions: [],
    rewards: [],
    otps: [],
  };
}

function ensureDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readDB() {
  ensureDir();
  if (!fs.existsSync(DB_PATH)) {
    const db = getDefaultDB();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    return db;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeDB(db) {
  ensureDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function generateId() {
  return uuidv4();
}

module.exports = { readDB, writeDB, generateId };
