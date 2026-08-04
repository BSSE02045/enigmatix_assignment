class UserController {
  constructor(userService) {
    this.userService = userService;
    this.list = this.list.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.deactivate = this.deactivate.bind(this);
  }

  async list(req, res, next) {
    try { res.json(await this.userService.listUsers(req.user)); }
    catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try { res.json(await this.userService.getUser(req.params.id)); }
    catch (err) { next(err); }
  }

  async update(req, res, next) {
    try { res.json(await this.userService.updateUser(req.params.id, req.body)); }
    catch (err) { next(err); }
  }

  async deactivate(req, res, next) {
    try {
      await this.userService.deactivateUser(req.params.id);
      res.json({ message: 'User deactivated' });
    } catch (err) { next(err); }
  }
}

module.exports = UserController;
