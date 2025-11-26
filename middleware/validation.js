const { body } = require("express-validator");

// Registration validation
exports.validateRegister = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .isIn(["recruiter", "applicant"])
    .withMessage('Role must be either "recruiter" or "applicant"'),
  body("first_name")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters"),
  body("last_name")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters"),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
  body("company_id")
    .optional()
    .isInt()
    .withMessage("Company ID must be a valid integer"),
  body("company_name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Company name must be at least 2 characters"),
];

// Login validation
exports.validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// Job creation validation
exports.validateJob = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Job title is required")
    .isLength({ min: 3, max: 255 })
    .withMessage("Job title must be between 3 and 255 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Job description is required")
    .isLength({ min: 10 })
    .withMessage("Job description must be at least 10 characters"),
  body("requirements").optional().trim(),
  body("location").optional().trim(),
  body("salary_min")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum salary must be a positive number"),
  body("salary_max")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum salary must be a positive number"),
  body("employment_type")
    .optional()
    .isIn(["full-time", "part-time", "contract", "internship"])
    .withMessage(
      "Employment type must be one of: full-time, part-time, contract, internship"
    ),
  body("company_id")
    .optional()
    .isInt()
    .withMessage("Company ID must be a valid integer"),
];

// Application validation
exports.validateApplication = [
  body("cover_letter")
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Cover letter must not exceed 5000 characters"),
  body("resume_url")
    .optional()
    .isURL()
    .withMessage("Resume URL must be a valid URL"),
];
