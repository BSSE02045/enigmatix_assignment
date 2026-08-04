class TeamController {
  constructor(teamService) {
    this.teamService = teamService;
    this.list = this.list.bind(this);
    this.members = this.members.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
  }

  async list(req, res, next) {
    try { res.json(await this.teamService.listTeams()); }
    catch (err) { next(err); }
  }

  async members(req, res, next) {
    try { res.json(await this.teamService.getMembers(req.params.id)); }
    catch (err) { next(err); }
  }

  async create(req, res, next) {
    try { res.status(201).json(await this.teamService.createTeam(req.body)); }
    catch (err) { next(err); }
  }

  async update(req, res, next) {
    try { res.json(await this.teamService.updateTeam(req.params.id, req.body)); }
    catch (err) { next(err); }
  }
}

module.exports = TeamController;
