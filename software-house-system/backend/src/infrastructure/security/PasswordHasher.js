const bcrypt = require('bcrypt');

/**
 * Wraps bcrypt behind a small, focused interface.
 * Services depend on THIS class, not on bcrypt directly — if you ever
 * swap hashing libraries, only this file changes (Single Responsibility
 * + Dependency Inversion in practice).
 */
class PasswordHasher {
  constructor(saltRounds = 10) {
    this.saltRounds = saltRounds;
  }

  async hash(plainPassword) {
    return bcrypt.hash(plainPassword, this.saltRounds);
  }

  async compare(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
  }
}

module.exports = PasswordHasher;
