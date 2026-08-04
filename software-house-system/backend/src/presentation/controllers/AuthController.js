/**
 * Controllers are deliberately "thin" — they only translate between
 * HTTP (req/res) and the application layer. No business logic lives here.
 */
class AuthController {
  constructor(authService) {
    this.authService = authService;
    // bind so routes can pass these methods directly without losing `this`
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.me = this.me.bind(this);
  }

  async register(req, res, next) {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json(result);
    } catch (err) { next(err); }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      res.json(result);
    } catch (err) { next(err); }
  }

  async me(req, res, next) {
    try {
      const profile = await this.authService.getProfile(req.user.id);
      res.json(profile);
    } catch (err) { next(err); }
  }
}

module.exports = AuthController;
