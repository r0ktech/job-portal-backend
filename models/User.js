const db = require("../config/database");
const bcrypt = require("bcryptjs");

class User {
  static async create(userData) {
    const { email, password, role, first_name, last_name, phone, company_id } =
      userData;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      `INSERT INTO users (email, password, role, first_name, last_name, phone, company_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        email,
        hashedPassword,
        role,
        first_name,
        last_name,
        phone || null,
        company_id || null,
      ]
    );

    return this.findById(result.insertId);
  }

  static async findByEmail(email) {
    const [rows] = await db.execute(
      `SELECT u.*, c.name as company_name 
             FROM users u 
             LEFT JOIN companies c ON u.company_id = c.id 
             WHERE u.email = ?`,
      [email]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT u.*, c.name as company_name 
             FROM users u 
             LEFT JOIN companies c ON u.company_id = c.id 
             WHERE u.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];

    if (updateData.first_name) {
      fields.push("first_name = ?");
      values.push(updateData.first_name);
    }
    if (updateData.last_name) {
      fields.push("last_name = ?");
      values.push(updateData.last_name);
    }
    if (updateData.phone) {
      fields.push("phone = ?");
      values.push(updateData.phone);
    }
    if (updateData.company_id !== undefined) {
      fields.push("company_id = ?");
      values.push(updateData.company_id);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await db.execute(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }
}

module.exports = User;
