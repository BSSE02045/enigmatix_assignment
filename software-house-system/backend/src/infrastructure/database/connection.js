const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Single MySQL connection pool for the whole app.
 * This is the ONLY place raw connection config is read —
 * every repository receives this pool via constructor injection,
 * never creates its own connection.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

module.exports = pool;
