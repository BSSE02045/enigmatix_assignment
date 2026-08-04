/**
 * Task — domain entity.
 * Encapsulates task state transitions and the authorization rule for
 * "who is allowed to change this task's status" — this rule lives HERE,
 * not scattered across a controller, because it's a business rule,
 * not an HTTP concern.
 */

const STATUSES = Object.freeze(['todo', 'in_progress', 'review', 'done']);
const PRIORITIES = Object.freeze(['low', 'medium', 'high', 'urgent']);

class Task {
  constructor({ id, title, description, projectId, teamId, assignedTo, assignedBy, status, priority, dueDate, createdAt, updatedAt }) {
    if (!title || !title.trim()) {
      throw new Error('Task title is required');
    }
    if (status && !STATUSES.includes(status)) {
      throw new Error(`Invalid status "${status}"`);
    }
    if (priority && !PRIORITIES.includes(priority)) {
      throw new Error(`Invalid priority "${priority}"`);
    }

    this.id = id;
    this.title = title;
    this.description = description || null;
    this.projectId = projectId || null;
    this.teamId = teamId || null;
    this.assignedTo = assignedTo || null;
    this.assignedBy = assignedBy || null;
    this.status = status || 'todo';
    this.priority = priority || 'medium';
    this.dueDate = dueDate || null;
    this.createdAt = createdAt || null;
    this.updatedAt = updatedAt || null;
  }

  /**
   * Business rule: a task's status may be changed by
   *  - the person it's assigned to
   *  - the lead of the team that owns it
   *  - an admin or shareholder (company-wide oversight)
   */
  canChangeStatus(user) {
    if (!user) return false;
    if (user.hasCompanyWideVisibility()) return true;
    if (this.assignedTo === user.id) return true;
    if (user.isTeamLead() && user.teamId === this.teamId) return true;
    return false;
  }

  changeStatus(newStatus, user) {
    if (!STATUSES.includes(newStatus)) {
      throw new Error(`Invalid status "${newStatus}". Must be one of: ${STATUSES.join(', ')}`);
    }
    if (!this.canChangeStatus(user)) {
      throw new Error('You do not have permission to change this task\'s status');
    }
    this.status = newStatus;
    return this;
  }

  isOverdue() {
    if (!this.dueDate || this.status === 'done') return false;
    return new Date(this.dueDate) < new Date();
  }
}

module.exports = { Task, STATUSES, PRIORITIES };
