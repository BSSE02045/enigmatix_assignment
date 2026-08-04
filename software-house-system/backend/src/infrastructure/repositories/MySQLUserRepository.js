const IUserRepository = require('../../domain/repositories/IUserRepository');
const { User } = require('../../domain/entities/User');

/**
 * Concrete MySQL implementation of IUserRepository.
 * Everything MySQL/SQL-specific is quarantined here — the rest of the
 * app never sees a raw SQL string or a mysql2 row object, only User entities.
 */
class MySQLUserRepository extends IUserRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  toEntity(row) {
    if (!row) return null;
    return new User({
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      designation: row.designation,
      teamId: row.team_id,
      companyName: row.company_name,
      isActive: row.is_active,
      createdAt: row.created_at
    });
  }

  async findById(id) {
    const [rows] = await this.pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return this.toEntity(rows[0]);
  }

  async findByEmail(email) {
    const [rows] = await this.pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return this.toEntity(rows[0]);
  }

  async findAll({ teamId } = {}) {
    let query = 'SELECT * FROM users';
    const params = [];
    if (teamId) {
      query += ' WHERE team_id = ?';
      params.push(teamId);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await this.pool.query(query, params);
    return rows.map((r) => this.toEntity(r));
  }

  async create(user) {
    const [result] = await this.pool.query(
      `INSERT INTO users (name, email, password_hash, role, designation, team_id, company_name)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user.name, user.email, user.passwordHash, user.role, user.designation, user.teamId, user.companyName]
    );
    return this.findById(result.insertId);
  }

  async update(id, changes) {
    const { name, role, designation, teamId, isActive } = changes;
    await this.pool.query(
      `UPDATE users SET name = COALESCE(?, name), role = COALESCE(?, role),
       designation = COALESCE(?, designation), team_id = COALESCE(?, team_id),
       is_active = COALESCE(?, is_active) WHERE id = ?`,
      [name, role, designation, teamId, isActive, id]
    );
    return this.findById(id);
  }

  async deactivate(id) {
    const [result] = await this.pool.query('UPDATE users SET is_active = FALSE WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = MySQLUserRepository;
