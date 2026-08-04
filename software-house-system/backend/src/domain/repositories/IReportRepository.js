class IReportRepository {
  async upsert(report) { throw new Error('Not implemented'); }
  async findAll({ userId, teamId, date } = {}) { throw new Error('Not implemented'); }
}

module.exports = IReportRepository;
