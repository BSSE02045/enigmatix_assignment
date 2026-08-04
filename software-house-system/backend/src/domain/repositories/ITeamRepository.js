class ITeamRepository {
  async findAll() { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
  async findMembers(teamId) { throw new Error('Not implemented'); }
  async create(team) { throw new Error('Not implemented'); }
  async update(id, changes) { throw new Error('Not implemented'); }
}

module.exports = ITeamRepository;
