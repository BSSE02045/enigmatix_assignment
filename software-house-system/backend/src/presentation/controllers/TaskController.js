class TaskController {
  constructor(taskService) {
    this.taskService = taskService;
    this.list = this.list.bind(this);
    this.create = this.create.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.update = this.update.bind(this);
    this.remove = this.remove.bind(this);
  }

  async list(req, res, next) {
    try { res.json(await this.taskService.listTasks(req.user)); }
    catch (err) { next(err); }
  }

  async create(req, res, next) {
    try { res.status(201).json(await this.taskService.createTask(req.body, req.user)); }
    catch (err) { next(err); }
  }

  async updateStatus(req, res, next) {
    try { res.json(await this.taskService.changeStatus(req.params.id, req.body.status, req.user)); }
    catch (err) { next(err); }
  }

  async update(req, res, next) {
    try { res.json(await this.taskService.updateTask(req.params.id, req.body)); }
    catch (err) { next(err); }
  }

  async remove(req, res, next) {
    try {
      await this.taskService.deleteTask(req.params.id);
      res.json({ message: 'Task deleted' });
    } catch (err) { next(err); }
  }
}

module.exports = TaskController;
