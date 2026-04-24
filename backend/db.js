const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'queuecare.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'patient',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    doctor TEXT NOT NULL,
    date TEXT NOT NULL,
    reason TEXT NOT NULL,
    queue_number INTEGER,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (patient_id) REFERENCES users(id)
  );
`);

module.exports = db;
