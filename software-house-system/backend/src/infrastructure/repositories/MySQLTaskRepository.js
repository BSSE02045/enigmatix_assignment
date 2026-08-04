const ITaskRepository = require('../../domain/repositories/ITaskRepository');
const { Task } = require('../../domain/entities/Task');

const SELECT = `
  SELECT t.*, u1.name AS assigned_to_name, u2.name AS assigned_by_name,
         p.name AS project_name, tm.name AS team_name
  FROM tasks t
  LEFT JOIN users u1 ON t.assigned_to = u1.id
  LEFT JOIN users u2 ON t.assigned_by = u2.id
  LEFT JOIN projects p ON t.project_id = p.id
  LEFT JOIN teams tm ON t.team_id = tm.id
`;

class MySQLTaskRepository extends ITaskRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  toEntity(row) {
    if (!row) return null;
    const task = new Task({
      id: row.id, title: row.title, description: row.description, projectId: row.project_id,
      teamId: row.team_id, assignedTo: row.assigned_to, assignedBy: row.assigned_by,
      status: row.status, priority: row.priority, dueDate: row.due_date,
      createdAt: row.created_at, updatedAt: row.updated_at
    });
    return Object.assign(task, {
      assignedToName: row.assigned_to_name,
      assignedByName: row.assigned_by_name,
      projectName: row.project_name,
      teamName: row.team_name
    });
  }

  async findAll({ assignedTo, teamId, clientId } = {}) {
    let query = SELECT;
    const conditions = [];
    const params = [];

    if (assignedTo) { conditions.push('t.assigned_to = ?'); params.push(assignedTo); }
    if (teamId) { conditions.push('t.team_id = ?'); params.push(teamId); }
    if (clientId) { conditions.push('p.client_id = ?'); params.push(clientId); }

    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY t.due_date IS NULL, t.due_date ASC';

    const [rows] = await this.pool.query(query, params);
    return rows.map((r) => this.toEntity(r));
  }

  async findById(id) {
    const [rows] = await this.pool.query(SELECT + ' WHERE t.id = ?', [id]);
    return this.toEntity(rows[0]);
  }

  async create(task) {
    const [result] = await this.pool.query(
      `INSERT INTO tasks (title, description, project_id, team_id, assigned_to, assigned_by, priority, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [task.title, task.description, task.projectId, task.teamId, task.assignedTo, task.assignedBy, task.priority, task.dueDate]
    );
    return this.findById(result.insertId);
  }

  async update(id, changes) {
    const { title, description, assignedTo, priority, dueDate } = changes;
    await this.pool.query(
      `UPDATE tasks SET title = COALESCE(?, title), description = COALESCE(?, description),
       assigned_to = COALESCE(?, assigned_to), priority = COALESCE(?, priority), due_date = COALESCE(?, due_date)
       WHERE id = ?`,
      [title, description, assignedTo, priority, dueDate, id]
    );
    return this.findById(id);
  }

  async updateStatus(id, status) {
    await this.pool.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  }

  async delete(id) {
    const [result] = await this.pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = MySQLTaskRepository;
