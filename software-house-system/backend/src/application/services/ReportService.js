class ReportService {
  constructor(reportRepository) {
    this.reportRepository = reportRepository;
  }

  async submitReport(data, requestingUser) {
    return this.reportRepository.upsert({
      userId: requestingUser.id,
      reportDate: data.report_date || new Date().toISOString().slice(0, 10),
      summary: data.summary,
      hoursWorked: data.hours_worked || 0,
      blockers: data.blockers,
      taskId: data.task_id
    });
  }

  /** Same visibility pattern as tasks: own / team / everyone, depending on role. */
  async listReports(requestingUser, filters = {}) {
    if (requestingUser.isStaff()) {
      return this.reportRepository.findAll({ userId: requestingUser.id, date: filters.date });
    }
    if (requestingUser.isTeamLead()) {
      return this.reportRepository.findAll({ teamId: requestingUser.teamId, date: filters.date, userId: filters.userId });
    }
    return this.reportRepository.findAll({ date: filters.date, userId: filters.userId });
  }
}

module.exports = ReportService;
