const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "dpg-d4jphkbe5dus73eot2u0-a",
  user: process.env.DB_USER || "job_portal_database_0o7q_user",
  password: process.env.DB_PASSWORD || "mw78q4mAqDUetzUu4YtXOsP297CSAyGT",
  database: process.env.DB_NAME || "job_portal_database_0o7q",
  port: process.env.DB_PORT || 5432,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection
pool
  .getConnection()
  .then((connection) => {
    console.log("✅ Database connected successfully");
    console.log(`   Host: ${process.env.DB_HOST || "localhost"}`);
    console.log(`   Database: ${process.env.DB_NAME || "job_portal"}`);
    connection.release();
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err.message);
    console.error("   Please check:");
    console.error("   1. MySQL/XAMPP is running");
    console.error("   2. Database credentials in .env file are correct");
    console.error(
      '   3. Database "job_portal" exists (run database/schema.sql)'
    );
    console.error(
      `   Current config: ${process.env.DB_HOST || "localhost"}:${
        process.env.DB_PORT || 3306
      }`
    );
  });

module.exports = pool;
