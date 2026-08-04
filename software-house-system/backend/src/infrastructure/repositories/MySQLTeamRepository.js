const ITeamRepository = require('../../domain/repositories/ITeamRepository');
const { Team } = require('../../domain/entities/Team');

class MySQLTeamRepository extends ITeamRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  toEntity(row) {
    if (!row) return null;
    return new Team({ id: row.id, name: row.name, description: row.description, leadId: row.lead_id, createdAt: row.created_at });
  }

  async findAll() {
    const [rows] = await this.pool.query(
      `SELECT t.*, u.name AS lead_name, (SELECT COUNT(*) FROM users WHERE team_id = t.id) AS member_count
       FROM teams t LEFT JOIN users u ON t.lead_id = u.id ORDER BY t.name`
    );
    // Attach the read-model extras (lead_name, member_count) alongside the entity
    return rows.map((r) => ({ ...this.toEntity(r), leadName: r.lead_name, memberCount: r.member_count }));
  }

  async findById(id) {
    const [rows] = await this.pool.query('SELECT * FROM teams WHERE id = ?', [id]);
    return this.toEntity(rows[0]);
  }

  async findMembers(teamId) {
    const [rows] = await this.pool.query(
      'SELECT id, name, email, role, designation FROM users WHERE team_id = ? ORDER BY name',
      [teamId]
    );
    return rows;
  }

  async create(team) {
    const [result] = await this.pool.query(
      'INSERT INTO teams (name, description, lead_id) VALUES (?, ?, ?)',
      [team.name, team.description, team.leadId]
    );
    return this.findById(result.insertId);
  }

  async update(id, changes) {
    const { name, description, leadId } = changes;
    await this.pool.query(
      'UPDATE teams SET name = COALESCE(?, name), description = COALESCE(?, description), lead_id = COALESCE(?, lead_id) WHERE id = ?',
      [name, description, leadId, id]
    );
    return this.findById(id);
  }
}

module.exports = MySQLTeamRepository;
