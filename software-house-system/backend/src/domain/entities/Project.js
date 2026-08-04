const STATUSES = Object.freeze(['planning', 'in_progress', 'on_hold', 'completed', 'cancelled']);

class Project {
  constructor({ id, name, description, clientId, status, startDate, dueDate, createdAt }) {
    if (!name || !name.trim()) throw new Error('Project name is required');
    if (status && !STATUSES.includes(status)) throw new Error(`Invalid project status "${status}"`);

    this.id = id;
    this.name = name;
    this.description = description || null;
    this.clientId = clientId || null;
    this.status = status || 'planning';
    this.startDate = startDate || null;
    this.dueDate = dueDate || null;
    this.createdAt = createdAt || null;
  }

  /** Business rule: only the assigned client/buyer may view their own project. */
  isVisibleTo(user) {
    if (!user) return false;
    if (!user.isClientSide()) return true; // internal roles see all projects
    return this.clientId === user.id;
  }
}

module.exports = { Project, STATUSES };
