class ProjectController {
  constructor(projectService) {
    this.projectService = projectService;
    this.list = this.list.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
  }

  async list(req, res, next) {
    try { res.json(await this.projectService.listProjects(req.user)); }
    catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try { res.json(await this.projectService.getProject(req.params.id, req.user)); }
    catch (err) { next(err); }
  }

  async create(req, res, next) {
    try { res.status(201).json(await this.projectService.createProject(req.body)); }
    catch (err) { next(err); }
  }

  async update(req, res, next) {
    try { res.json(await this.projectService.updateProject(req.params.id, req.body)); }
    catch (err) { next(err); }
  }
}

module.exports = ProjectController;
