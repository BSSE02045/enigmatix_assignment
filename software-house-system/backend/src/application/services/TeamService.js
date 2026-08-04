class TeamService {
  constructor(teamRepository) {
    this.teamRepository = teamRepository;
  }

  async listTeams() {
    return this.teamRepository.findAll();
  }

  async getMembers(teamId) {
    return this.teamRepository.findMembers(teamId);
  }

  async createTeam({ name, description, leadId }) {
    return this.teamRepository.create({ name, description, leadId });
  }

  async updateTeam(id, changes) {
    const updated = await this.teamRepository.update(id, changes);
    if (!updated) throw new Error('Team not found');
    return updated;
  }
}

module.exports = TeamService;
