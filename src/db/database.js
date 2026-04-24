const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const schema = require('./schema');

// ✅ IMPORTANT: Support both local + Render
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../sprintdesk.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
if (err) console.error('❌ DB connection error:', err);
else console.log('✅ Database connected:', DB_PATH);
});

db.run('PRAGMA foreign_keys = ON');

// Create tables
const statements = schema.split(';').filter(s => s.trim());

statements.forEach(statement => {
db.run(statement, err => {
if (err) console.error('Schema error:', err.message);
});
});

module.exports = db;
