class Team {
  constructor({ id, name, description, leadId, createdAt }) {
    if (!name || !name.trim()) throw new Error('Team name is required');
    this.id = id;
    this.name = name;
    this.description = description || null;
    this.leadId = leadId || null;
    this.createdAt = createdAt || null;
  }

  hasLead() {
    return this.leadId !== null;
  }
}

module.exports = { Team };
