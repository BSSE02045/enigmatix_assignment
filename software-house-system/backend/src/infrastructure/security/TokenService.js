const jwt = require('jsonwebtoken');

/**
 * Wraps jsonwebtoken. Same idea as PasswordHasher — isolate the
 * third-party library behind our own class so the rest of the app
 * only ever talks to TokenService.
 */
class TokenService {
  constructor(secret, expiresIn = '7d') {
    if (!secret) throw new Error('TokenService requires a JWT secret');
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  sign(payload) {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verify(token) {
    return jwt.verify(token, this.secret);
  }
}

module.exports = TokenService;
