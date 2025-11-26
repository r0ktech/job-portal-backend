-- Create database
CREATE DATABASE IF NOT EXISTS job_portal;
USE job_portal;

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('recruiter', 'applicant') NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    company_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    location VARCHAR(255),
    salary_min DECIMAL(10, 2),
    salary_max DECIMAL(10, 2),
    employment_type ENUM('full-time', 'part-time', 'contract', 'internship') DEFAULT 'full-time',
    status ENUM('active', 'closed', 'draft') DEFAULT 'active',
    recruiter_id INT NOT NULL,
    company_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    INDEX idx_recruiter (recruiter_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    applicant_id INT NOT NULL,
    status ENUM('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted') DEFAULT 'pending',
    cover_letter TEXT,
    resume_url VARCHAR(500),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (job_id, applicant_id),
    INDEX idx_job (job_id),
    INDEX idx_applicant (applicant_id),
    INDEX idx_status (status)
);
