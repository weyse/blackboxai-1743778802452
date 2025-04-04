const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Database connection
const db = new sqlite3.Database(path.join(__dirname, 'wahana-bermain.db'));

// Initialize database tables
const initializeDatabase = () => {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'staff')) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Front desk tables
    db.run(`CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      contact_number TEXT NOT NULL,
      saung_type TEXT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      status TEXT DEFAULT 'pending'
    )`);

    // Inventory tables
    db.run(`CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      unit TEXT NOT NULL,
      warehouse_id INTEGER NOT NULL
    )`);

    // Accounting tables
    db.run(`CREATE TABLE IF NOT EXISTS accounts (
      account_id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_code TEXT UNIQUE NOT NULL,
      account_name TEXT NOT NULL,
      account_type TEXT CHECK(account_type IN ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')) NOT NULL,
      normal_balance TEXT CHECK(normal_balance IN ('Debit', 'Credit')) NOT NULL,
      current_balance REAL DEFAULT 0.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS journal_entries (
      entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_date DATE NOT NULL,
      description TEXT,
      reference TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS journal_items (
      item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER REFERENCES journal_entries(entry_id),
      account_id INTEGER REFERENCES accounts(account_id),
      amount REAL NOT NULL,
      type TEXT CHECK(type IN ('Debit', 'Credit')) NOT NULL,
      description TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS budgets (
      budget_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      account_id INTEGER REFERENCES accounts(account_id),
      period_start DATE NOT NULL,
      period_end DATE NOT NULL,
      amount REAL NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Activities table
    db.run(`CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      activity_type TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create default admin user
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('admin123', salt);
    db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)`, 
      ['admin', hashedPassword, 'admin']);

    // Seed initial chart of accounts
    db.run(`INSERT OR IGNORE INTO accounts (account_code, account_name, account_type, normal_balance) VALUES 
      ('1000', 'Cash', 'Asset', 'Debit'),
      ('1100', 'Accounts Receivable', 'Asset', 'Debit'),
      ('1200', 'Inventory', 'Asset', 'Debit'),
      ('2000', 'Accounts Payable', 'Liability', 'Credit'),
      ('3000', 'Owner''s Equity', 'Equity', 'Credit'),
      ('4000', 'Service Revenue', 'Revenue', 'Credit'),
      ('5000', 'Salaries Expense', 'Expense', 'Debit'),
      ('5100', 'Rent Expense', 'Expense', 'Debit'),
      ('5200', 'Utilities Expense', 'Expense', 'Debit')`);
  });
};

module.exports = {
  db,
  initializeDatabase
};