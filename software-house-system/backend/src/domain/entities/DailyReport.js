class DailyReport {
  constructor({ id, userId, reportDate, summary, hoursWorked, blockers, taskId, createdAt }) {
    if (!userId) throw new Error('DailyReport requires a userId');
    if (!summary || !summary.trim()) throw new Error('DailyReport summary is required');

    const hours = hoursWorked === undefined || hoursWorked === null ? 0 : Number(hoursWorked);
    if (Number.isNaN(hours) || hours < 0 || hours > 24) {
      throw new Error('hoursWorked must be a number between 0 and 24');
    }

    this.id = id;
    this.userId = userId;
    this.reportDate = reportDate || new Date().toISOString().slice(0, 10);
    this.summary = summary;
    this.hoursWorked = hours;
    this.blockers = blockers || null;
    this.taskId = taskId || null;
    this.createdAt = createdAt || null;
  }

  hasBlockers() {
    return !!this.blockers;
  }
}

module.exports = { DailyReport };
