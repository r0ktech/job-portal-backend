const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");
const {
  authenticate,
  isApplicant,
  isRecruiter,
} = require("../middleware/auth");

// Get user's applications (applicant only)
router.get(
  "/my-applications",
  authenticate,
  isApplicant,
  applicationController.getMyApplications
);

// Update application status (recruiter only)
router.put(
  "/applications/:id/status",
  authenticate,
  isRecruiter,
  applicationController.updateApplicationStatus
);

module.exports = router;
