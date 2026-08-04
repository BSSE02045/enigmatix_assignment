const { User } = require('../../domain/entities/User');

/**
 * Factory that builds authentication/authorization middleware.
 * Takes the TokenService via injection rather than importing jwt directly —
 * keeps this file HTTP-only, with no knowledge of *how* tokens are verified.
 */
function makeAuthMiddleware(tokenService) {
  function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    try {
      const payload = tokenService.verify(header.split(' ')[1]);
      // Rehydrate a real User entity so req.user carries business behaviour
      // (isAdmin(), canManageTeam(), etc.), not just a plain data bag.
      req.user = new User({
        id: payload.id, name: payload.name, email: payload.email,
        role: payload.role, teamId: payload.teamId, passwordHash: null
      });
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  function authorize(...allowedRoles) {
    return (req, res, next) => {
      if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'You do not have permission to perform this action' });
      }
      next();
    };
  }

  return { authenticate, authorize };
}

module.exports = makeAuthMiddleware;
