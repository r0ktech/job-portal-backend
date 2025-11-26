const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const Company = require("../models/Company");

// Generate JWT token
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not configured. Please set it in your .env file."
    );
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Register new user
exports.register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      email,
      password,
      role,
      first_name,
      last_name,
      phone,
      company_id,
      company_name,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    let finalCompanyId = company_id;

    // If recruiter and company_name provided but no company_id, create company
    if (role === "recruiter" && company_name && !company_id) {
      const company = await Company.create({ name: company_name });
      finalCompanyId = company.id;
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role,
      first_name,
      last_name,
      phone,
      company_id: finalCompanyId,
    });

    // Remove password from response
    delete user.password;

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    // Provide more specific error messages
    let errorMessage = "Error registering user";
    let statusCode = 500;

    if (error.code === "ER_DUP_ENTRY") {
      errorMessage = "User with this email already exists";
      statusCode = 400;
    } else if (
      error.code === "ECONNREFUSED" ||
      error.code === "ER_ACCESS_DENIED_ERROR"
    ) {
      errorMessage =
        "Database connection failed. Please check your database configuration.";
      statusCode = 500;
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
        stack: error.stack,
      }),
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify password
    const isPasswordValid = await User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Remove password from response
    delete user.password;

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    // Provide more specific error messages
    let errorMessage = "Error logging in";
    let statusCode = 500;

    if (
      error.code === "ECONNREFUSED" ||
      error.code === "ER_ACCESS_DENIED_ERROR"
    ) {
      errorMessage =
        "Database connection failed. Please check your database configuration.";
      statusCode = 500;
    } else if (error.message && error.message.includes("JWT_SECRET")) {
      errorMessage = "Server configuration error. Please contact support.";
      statusCode = 500;
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
        stack: error.stack,
      }),
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    delete user.password;

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
};
