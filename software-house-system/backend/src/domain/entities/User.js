/**
 * User — domain entity.
 * Pure business object: no framework code, no SQL, no HTTP.
 * Encapsulates the rules about what a user IS and CAN DO,
 * independent of how it's stored or transported.
 */

const ROLES = Object.freeze([
  'admin', 'shareholder', 'client', 'buyer',
  'team_lead', 'staff', 'employee', 'intern'
]);

const STAFF_ROLES = Object.freeze(['intern', 'employee', 'staff']);
const CLIENT_ROLES = Object.freeze(['client', 'buyer']);

class User {
  constructor({ id, name, email, passwordHash, role, designation, teamId, companyName, isActive, createdAt }) {
    if (!ROLES.includes(role)) {
      throw new Error(`Invalid role "${role}". Must be one of: ${ROLES.join(', ')}`);
    }
    this.id = id;
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.designation = designation || null;
    this.teamId = teamId || null;
    this.companyName = companyName || null;
    this.isActive = isActive !== undefined ? !!isActive : true;
    this.createdAt = createdAt || null;
  }

  isAdmin() {
    return this.role === 'admin';
  }

  isShareholder() {
    return this.role === 'shareholder';
  }

  isTeamLead() {
    return this.role === 'team_lead';
  }

  isStaff() {
    return STAFF_ROLES.includes(this.role);
  }

  isClientSide() {
    return CLIENT_ROLES.includes(this.role);
  }

  /** Can this user see the full user/team roster, or only their own team? */
  hasCompanyWideVisibility() {
    return this.isAdmin() || this.isShareholder();
  }

  /** Business rule: who is allowed to lead/manage a given team. */
  canManageTeam(teamId) {
    return this.isAdmin() || (this.isTeamLead() && this.teamId === teamId);
  }

  /** Strips sensitive fields before the entity is ever sent over HTTP. */
  toPublicJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      designation: this.designation,
      teamId: this.teamId,
      companyName: this.companyName,
      isActive: this.isActive,
      createdAt: this.createdAt
    };
  }
}

module.exports = { User, ROLES, STAFF_ROLES, CLIENT_ROLES };
