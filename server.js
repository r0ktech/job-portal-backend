const express = require("express");
const path = require("path");
require("dotenv").config();

// Check for required environment variables
const missingVars = [];
if (!process.env.JWT_SECRET) {
  missingVars.push("JWT_SECRET");
  console.error("⚠️  WARNING: JWT_SECRET is not set in .env file!");
  console.error(
    "   Authentication will fail. Please create a .env file with JWT_SECRET."
  );
  console.error(
    "   Example: JWT_SECRET=your-super-secret-jwt-key-change-this-in-production"
  );
}

if (missingVars.length > 0) {
  console.error(
    "\n❌ Missing required environment variables:",
    missingVars.join(", ")
  );
  console.error(
    "   Please create a .env file in the root directory with these variables.\n"
  );
}

const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware - Allow frontend to access API from different origin
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:3001", // Frontend dev server
    "http://localhost:3000", // Alternative frontend
    "http://127.0.0.1:3001",
    process.env.FRONTEND_URL, // Production frontend URL from env
  ].filter(Boolean);

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Request logging middleware (before routes for better debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api", applicationRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Job Portal API is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.path,
    method: req.method,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n✅ Job Portal Backend Server`);
  console.log(`   Running on: http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(
    `\n   Frontend URL: ${
      process.env.FRONTEND_URL || "http://localhost:3001"
    }\n`
  );
});

module.exports = app;
