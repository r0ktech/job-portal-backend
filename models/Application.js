const db = require("../config/database");

class Application {
  static async create(applicationData) {
    const { job_id, applicant_id, cover_letter, resume_url } = applicationData;

    // Check if application already exists
    const existing = await this.findByJobAndApplicant(job_id, applicant_id);
    if (existing) {
      throw new Error("You have already applied for this job");
    }

    const [result] = await db.execute(
      `INSERT INTO applications (job_id, applicant_id, cover_letter, resume_url) 
             VALUES (?, ?, ?, ?)`,
      [job_id, applicant_id, cover_letter || null, resume_url || null]
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT a.*, 
                    j.title as job_title,
                    u.first_name as applicant_first_name,
                    u.last_name as applicant_last_name,
                    u.email as applicant_email
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             JOIN users u ON a.applicant_id = u.id
             WHERE a.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByJobAndApplicant(job_id, applicant_id) {
    const [rows] = await db.execute(
      "SELECT * FROM applications WHERE job_id = ? AND applicant_id = ?",
      [job_id, applicant_id]
    );
    return rows[0] || null;
  }

  static async findByJobId(job_id) {
    const [rows] = await db.execute(
      `SELECT a.*, 
                    u.first_name as applicant_first_name,
                    u.last_name as applicant_last_name,
                    u.email as applicant_email,
                    u.phone as applicant_phone
             FROM applications a
             JOIN users u ON a.applicant_id = u.id
             WHERE a.job_id = ?
             ORDER BY a.applied_at DESC`,
      [job_id]
    );
    return rows;
  }

  static async findByApplicantId(applicant_id) {
    const [rows] = await db.execute(
      `SELECT a.*, 
                    j.title as job_title,
                    j.location as job_location,
                    j.employment_type,
                    c.name as company_name
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             LEFT JOIN companies c ON j.company_id = c.id
             WHERE a.applicant_id = ?
             ORDER BY a.applied_at DESC`,
      [applicant_id]
    );
    return rows;
  }

  static async updateStatus(id, status) {
    await db.execute("UPDATE applications SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
    return this.findById(id);
  }
}

module.exports = Application;
