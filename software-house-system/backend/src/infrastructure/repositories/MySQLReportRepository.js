const IReportRepository = require('../../domain/repositories/IReportRepository');
const { DailyReport } = require('../../domain/entities/DailyReport');

const SELECT = `
  SELECT r.*, u.name AS user_name, u.designation, t.title AS task_title
  FROM daily_reports r
  JOIN users u ON r.user_id = u.id
  LEFT JOIN tasks t ON r.task_id = t.id
`;

class MySQLReportRepository extends IReportRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  toEntity(row) {
    if (!row) return null;
    const report = new DailyReport({
      id: row.id, userId: row.user_id, reportDate: row.report_date, summary: row.summary,
      hoursWorked: row.hours_worked, blockers: row.blockers, taskId: row.task_id, createdAt: row.created_at
    });
    return Object.assign(report, { userName: row.user_name, designation: row.designation, taskTitle: row.task_title });
  }

  async upsert(report) {
    const [result] = await this.pool.query(
      `INSERT INTO daily_reports (user_id, report_date, summary, hours_worked, blockers, task_id)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE summary = VALUES(summary), hours_worked = VALUES(hours_worked), blockers = VALUES(blockers)`,
      [report.userId, report.reportDate, report.summary, report.hoursWorked, report.blockers, report.taskId]
    );

    if (result.insertId) {
      const [rows] = await this.pool.query(SELECT + ' WHERE r.id = ?', [result.insertId]);
      return this.toEntity(rows[0]);
    }
    const [rows] = await this.pool.query(
      SELECT + ' WHERE r.user_id = ? AND r.report_date = ? AND (r.task_id <=> ?)',
      [report.userId, report.reportDate, report.taskId]
    );
    return this.toEntity(rows[0]);
  }

  async findAll({ userId, teamId, date } = {}) {
    let query = SELECT;
    const conditions = [];
    const params = [];

    if (userId) { conditions.push('r.user_id = ?'); params.push(userId); }
    if (teamId) { conditions.push('u.team_id = ?'); params.push(teamId); }
    if (date) { conditions.push('r.report_date = ?'); params.push(date); }

    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY r.report_date DESC, r.created_at DESC';

    const [rows] = await this.pool.query(query, params);
    return rows.map((r) => this.toEntity(r));
  }
}

module.exports = MySQLReportRepository;
