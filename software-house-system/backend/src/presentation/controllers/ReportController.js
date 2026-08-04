class ReportController {
  constructor(reportService) {
    this.reportService = reportService;
    this.submit = this.submit.bind(this);
    this.list = this.list.bind(this);
  }

  async submit(req, res, next) {
    try { res.status(201).json(await this.reportService.submitReport(req.body, req.user)); }
    catch (err) { next(err); }
  }

  async list(req, res, next) {
    try {
      const filters = { date: req.query.date, userId: req.query.user_id };
      res.json(await this.reportService.listReports(req.user, filters));
    } catch (err) { next(err); }
  }
}

module.exports = ReportController;
