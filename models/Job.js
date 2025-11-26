const db = require("../config/database");

class Job {
  static async create(jobData) {
    const {
      title,
      description,
      requirements,
      location,
      salary_min,
      salary_max,
      employment_type,
      recruiter_id,
      company_id,
    } = jobData;

    const [result] = await db.execute(
      `INSERT INTO jobs (title, description, requirements, location, salary_min, salary_max, employment_type, recruiter_id, company_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        requirements || null,
        location || null,
        salary_min || null,
        salary_max || null,
        employment_type || "full-time",
        recruiter_id,
        company_id || null,
      ]
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT j.*, 
                    u.first_name as recruiter_first_name, 
                    u.last_name as recruiter_last_name,
                    u.email as recruiter_email,
                    c.name as company_name
             FROM jobs j
             LEFT JOIN users u ON j.recruiter_id = u.id
             LEFT JOIN companies c ON j.company_id = c.id
             WHERE j.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findAll(filters = {}) {
    let query = `SELECT j.*, 
                            u.first_name as recruiter_first_name, 
                            u.last_name as recruiter_last_name,
                            c.name as company_name
                     FROM jobs j
                     LEFT JOIN users u ON j.recruiter_id = u.id
                     LEFT JOIN companies c ON j.company_id = c.id
                     WHERE 1=1`;
    const params = [];

    if (filters.status) {
      query += " AND j.status = ?";
      params.push(filters.status);
    }

    if (filters.recruiter_id) {
      query += " AND j.recruiter_id = ?";
      params.push(filters.recruiter_id);
    }

    if (filters.location) {
      query += " AND j.location LIKE ?";
      params.push(`%${filters.location}%`);
    }

    if (filters.employment_type) {
      query += " AND j.employment_type = ?";
      params.push(filters.employment_type);
    }

    query += " ORDER BY j.created_at DESC";

    if (filters.limit) {
      query += " LIMIT ?";
      params.push(parseInt(filters.limit));
    }

    if (filters.offset) {
      query += " OFFSET ?";
      params.push(parseInt(filters.offset));
    }

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];

    const allowedFields = [
      "title",
      "description",
      "requirements",
      "location",
      "salary_min",
      "salary_max",
      "employment_type",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updateData[field]);
      }
    });

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await db.execute(
      `UPDATE jobs SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    await db.execute("DELETE FROM jobs WHERE id = ?", [id]);
    return true;
  }
}

module.exports = Job;
