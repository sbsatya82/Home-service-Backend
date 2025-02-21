const mysql = require("mysql2");
require("dotenv").config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Max connections in pool
  queueLimit: 0, // Unlimited queue
  connectTimeout: 10000, // 10 sec timeout
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    return;
  }
  console.log("✅ Connected to database.");
  connection.release(); // Release back to pool
});

// Graceful shutdown - close DB connections on exit
process.on("SIGINT", () => {
  console.log("\n🔄 Closing database connection...");
  pool.end((err) => {
    if (err) console.error("❌ Error closing connection:", err.message);
    else console.log("✅ Database connection closed.");
    process.exit(err ? 1 : 0);
  });
});

// Export the pool for use in queries
module.exports = pool.promise();
