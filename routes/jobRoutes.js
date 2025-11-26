const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const applicationController = require("../controllers/applicationController");
const {
  authenticate,
  isRecruiter,
  isApplicant,
} = require("../middleware/auth");
const {
  validateJob,
  validateApplication,
} = require("../middleware/validation");

// Public route - Get all jobs (with optional filters)
router.get("/", jobController.getAllJobs);

// Protected routes - Recruiter only
router.post(
  "/",
  authenticate,
  isRecruiter,
  validateJob,
  jobController.createJob
);

// More specific routes must come before /:id
// Get applicants for a job (recruiter only)
router.get(
  "/:id/applicants",
  authenticate,
  isRecruiter,
  jobController.getJobApplicants
);

// Apply for a job (applicant only)
router.post(
  "/:id/apply",
  authenticate,
  isApplicant,
  validateApplication,
  applicationController.applyForJob
);

// Public route - Get single job
router.get("/:id", jobController.getJobById);

// Protected routes - Recruiter only (own jobs)
router.put("/:id", authenticate, isRecruiter, jobController.updateJob);
router.delete("/:id", authenticate, isRecruiter, jobController.deleteJob);

module.exports = router;
