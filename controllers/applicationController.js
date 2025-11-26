const { validationResult } = require("express-validator");
const Application = require("../models/Application");
const Job = require("../models/Job");

// Apply for a job (applicant only)
exports.applyForJob = async (req, res) => {
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

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This job is not currently accepting applications",
      });
    }

    const applicationData = {
      job_id: req.params.id,
      applicant_id: req.user.id,
      cover_letter: req.body.cover_letter,
      resume_url: req.body.resume_url,
    };

    const application = await Application.create(applicationData);

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: { application },
    });
  } catch (error) {
    console.error("Apply for job error:", error);

    if (error.message === "You have already applied for this job") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error submitting application",
      error: error.message,
    });
  }
};

// Get user's applications (applicant only)
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.findByApplicantId(req.user.id);

    res.json({
      success: true,
      count: applications.length,
      data: { applications },
    });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching applications",
      error: error.message,
    });
  }
};

// Update application status (recruiter only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "reviewed",
      "shortlisted",
      "rejected",
      "accepted",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Verify the job belongs to the recruiter
    const job = await Job.findById(application.job_id);
    if (job.recruiter_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update applications for your own jobs",
      });
    }

    const updatedApplication = await Application.updateStatus(
      req.params.id,
      status
    );

    res.json({
      success: true,
      message: "Application status updated successfully",
      data: { application: updatedApplication },
    });
  } catch (error) {
    console.error("Update application status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating application status",
      error: error.message,
    });
  }
};
