const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true, // Wait for a connection to become available
  connectionLimit: 10, // Maximum number of connections in the pool
  queueLimit: 0, // Unlimited number of pending requests
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');
  connection.release(); // Release the connection back to the pool
});

// Export the pool for use in your application
module.exports = pool.promise(); // Use promise-based API for async/await
