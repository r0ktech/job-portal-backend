const mysql = require("mysql2/promise");
require("dotenv").config();

const poolConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "job_portal",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

if (process.env.DB_SSL === "true") {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = mysql.createPool(poolConfig);

// Test database connection
pool
  .getConnection()
  .then((connection) => {
    console.log("✅ Database connected successfully");
    console.log(`   Host: ${poolConfig.host}`);
    console.log(`   Port: ${poolConfig.port}`);
    console.log(`   Database: ${poolConfig.database}`);
    if (poolConfig.ssl) {
      console.log("   SSL: enabled");
    } else {
      console.log("   SSL: disabled");
    }
    connection.release();
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err.message);
    console.error("   Please check:");
    console.error("   1. MySQL server is running (e.g., XAMPP, Docker)");
    console.error("   2. Database credentials in .env file are correct");
    console.error("   3. Database exists (run `database/schema.sql`)");
    console.error(`   Current config: ${poolConfig.host}:${poolConfig.port}`);
  });

module.exports = pool;
