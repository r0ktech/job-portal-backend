const { validationResult } = require("express-validator");
const Job = require("../models/Job");
const Application = require("../models/Application");

// Get all jobs (with optional filters)
exports.getAllJobs = async (req, res) => {
  try {
    const filters = {
      status: req.query.status || "active",
      location: req.query.location,
      employment_type: req.query.employment_type,
      limit: req.query.limit,
      offset: req.query.offset,
    };

    // If user is recruiter, show their jobs regardless of status
    if (req.user && req.user.role === "recruiter") {
      filters.recruiter_id = req.user.id;
      delete filters.status; // Recruiters can see all their jobs
    }

    const jobs = await Job.findAll(filters);

    res.json({
      success: true,
      count: jobs.length,
      data: { jobs },
    });
  } catch (error) {
    console.error("Get jobs error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching jobs",
      error: error.message,
    });
  }
};

// Get single job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.json({
      success: true,
      data: { job },
    });
  } catch (error) {
    console.error("Get job error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching job",
      error: error.message,
    });
  }
};

// Create new job (recruiter only)
exports.createJob = async (req, res) => {
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

    const jobData = {
      ...req.body,
      recruiter_id: req.user.id,
      company_id: req.user.company_id || req.body.company_id,
    };

    const job = await Job.create(jobData);

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: { job },
    });
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating job",
      error: error.message,
    });
  }
};

// Update job (recruiter only - own jobs)
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if user is the recruiter who created this job
    if (job.recruiter_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own jobs",
      });
    }

    const updatedJob = await Job.update(req.params.id, req.body);

    res.json({
      success: true,
      message: "Job updated successfully",
      data: { job: updatedJob },
    });
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating job",
      error: error.message,
    });
  }
};

// Delete job (recruiter only - own jobs)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if user is the recruiter who created this job
    if (job.recruiter_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own jobs",
      });
    }

    await Job.delete(req.params.id);

    res.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting job",
      error: error.message,
    });
  }
};

// Get applicants for a job (recruiter only)
exports.getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if user is the recruiter who created this job
    if (job.recruiter_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only view applicants for your own jobs",
      });
    }

    const applicants = await Application.findByJobId(req.params.id);

    res.json({
      success: true,
      count: applicants.length,
      data: {
        job: {
          id: job.id,
          title: job.title,
        },
        applicants,
      },
    });
  } catch (error) {
    console.error("Get applicants error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching applicants",
      error: error.message,
    });
  }
};
