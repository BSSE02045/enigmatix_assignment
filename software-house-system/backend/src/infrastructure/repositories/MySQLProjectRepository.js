const IProjectRepository = require('../../domain/repositories/IProjectRepository');
const { Project } = require('../../domain/entities/Project');

class MySQLProjectRepository extends IProjectRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  toEntity(row) {
    if (!row) return null;
    return new Project({
      id: row.id, name: row.name, description: row.description, clientId: row.client_id,
      status: row.status, startDate: row.start_date, dueDate: row.due_date, createdAt: row.created_at
    });
  }

  async findAll({ clientId } = {}) {
    let query = `SELECT p.*, u.name AS client_name FROM projects p LEFT JOIN users u ON p.client_id = u.id`;
    const params = [];
    if (clientId) {
      query += ' WHERE p.client_id = ?';
      params.push(clientId);
    }
    query += ' ORDER BY p.created_at DESC';
    const [rows] = await this.pool.query(query, params);
    return rows.map((r) => ({ ...this.toEntity(r), clientName: r.client_name }));
  }

  async findById(id) {
    const [rows] = await this.pool.query(
      `SELECT p.*, u.name AS client_name FROM projects p LEFT JOIN users u ON p.client_id = u.id WHERE p.id = ?`,
      [id]
    );
    if (!rows[0]) return null;
    return { ...this.toEntity(rows[0]), clientName: rows[0].client_name };
  }

  async create(project) {
    const [result] = await this.pool.query(
      `INSERT INTO projects (name, description, client_id, status, start_date, due_date) VALUES (?, ?, ?, ?, ?, ?)`,
      [project.name, project.description, project.clientId, project.status, project.startDate, project.dueDate]
    );
    return this.findById(result.insertId);
  }

  async update(id, changes) {
    const { name, description, status, startDate, dueDate } = changes;
    await this.pool.query(
      `UPDATE projects SET name = COALESCE(?, name), description = COALESCE(?, description),
       status = COALESCE(?, status), start_date = COALESCE(?, start_date), due_date = COALESCE(?, due_date) WHERE id = ?`,
      [name, description, status, startDate, dueDate, id]
    );
    return this.findById(id);
  }

  async getTaskBreakdown(projectId) {
    const [rows] = await this.pool.query(
      'SELECT status, COUNT(*) AS count FROM tasks WHERE project_id = ? GROUP BY status',
      [projectId]
    );
    return rows;
  }
}

module.exports = MySQLProjectRepository;
