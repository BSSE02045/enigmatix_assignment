const { User, ROLES } = require('../../domain/entities/User');

/**
 * AuthService — application layer.
 * Depends only on the IUserRepository ABSTRACTION, a PasswordHasher,
 * and a TokenService — all injected via the constructor. It has never
 * heard of MySQL, Express, or bcrypt directly. This is what makes it
 * unit-testable without a real database.
 */
class AuthService {
  constructor(userRepository, passwordHasher, tokenService) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }

  _issueToken(user) {
    return this.tokenService.sign({
      id: user.id, role: user.role, teamId: user.teamId, name: user.name, email: user.email
    });
  }

  async register({ name, email, password, role, designation, teamId, companyName }) {
    if (!name || !email || !password || !role) {
      throw new Error('name, email, password and role are required');
    }
    if (!ROLES.includes(role)) {
      throw new Error(`role must be one of: ${ROLES.join(', ')}`);
    }

    const existing = await this.userRepository.findByEmail(email);
    if (existing) throw new Error('An account with this email already exists');

    const passwordHash = await this.passwordHasher.hash(password);
    const draft = new User({ name, email, passwordHash, role, designation, teamId, companyName });
    const created = await this.userRepository.create(draft);

    return { user: created.toPublicJSON(), token: this._issueToken(created) };
  }

  async login(email, password) {
    if (!email || !password) throw new Error('email and password are required');

    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error('Invalid email or password');
    if (!user.isActive) throw new Error('This account has been deactivated');

    const matches = await this.passwordHasher.compare(password, user.passwordHash);
    if (!matches) throw new Error('Invalid email or password');

    return { user: user.toPublicJSON(), token: this._issueToken(user) };
  }

  async getProfile(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    return user.toPublicJSON();
  }
}

module.exports = AuthService;
