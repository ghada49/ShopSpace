const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

function ensureColumn(table, column, definition) {
  db.all(`PRAGMA table_info(${table})`, (err, columns) => {
    if (err) {
      console.error(`Error checking ${table}.${column}:`, err.message);
      return;
    }

    if (!columns.some(existingColumn => existingColumn.name === column)) {
      db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`, alterErr => {
        if (alterErr) console.error(`Error adding ${table}.${column}:`, alterErr.message);
      });
    }
  });
}

// Setup tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      preferred_category TEXT,
      preferred_location TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      host_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      size TEXT,
      price_per_day REAL NOT NULL,
      location TEXT,
      image_url TEXT,
      foot_traffic INTEGER,
      exposure_score REAL,
      verified BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (host_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER,
      brand_id INTEGER,
      start_date DATETIME NOT NULL,
      end_date DATETIME NOT NULL,
      status TEXT DEFAULT 'pending',
      total_price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (listing_id) REFERENCES listings(id),
      FOREIGN KEY (brand_id) REFERENCES users(id)
    )
  `);

  ensureColumn('listings', 'price_unit', "TEXT DEFAULT 'day'");
  ensureColumn('listings', 'area_value', 'REAL');
  ensureColumn('listings', 'area_unit', "TEXT DEFAULT 'sq ft'");
  ensureColumn('listings', 'traffic_unit', "TEXT DEFAULT 'day'");
  ensureColumn('listings', 'exposure_unit', "TEXT DEFAULT '/10'");
  ensureColumn('listings', 'location_url', 'TEXT');
  ensureColumn('listings', 'region', 'TEXT');
  ensureColumn('listings', 'shop_url', 'TEXT');
});

// Helper for Promises since sqlite3 uses callbacks
const runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const getAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
};

const allAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
};

module.exports = {
  db,
  runAsync,
  getAsync,
  allAsync
};
