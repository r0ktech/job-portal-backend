const db = require("../config/database");

class Company {
  static async create(companyData) {
    const { name, description, website } = companyData;

    const [result] = await db.execute(
      `INSERT INTO companies (name, description, website) 
             VALUES (?, ?, ?)`,
      [name, description || null, website || null]
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await db.execute("SELECT * FROM companies WHERE id = ?", [
      id,
    ]);
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await db.execute("SELECT * FROM companies ORDER BY name");
    return rows;
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];

    if (updateData.name) {
      fields.push("name = ?");
      values.push(updateData.name);
    }
    if (updateData.description !== undefined) {
      fields.push("description = ?");
      values.push(updateData.description);
    }
    if (updateData.website !== undefined) {
      fields.push("website = ?");
      values.push(updateData.website);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await db.execute(
      `UPDATE companies SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }
}

module.exports = Company;
