class IProjectRepository {
  async findAll({ clientId } = {}) { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
  async create(project) { throw new Error('Not implemented'); }
  async update(id, changes) { throw new Error('Not implemented'); }
  async getTaskBreakdown(projectId) { throw new Error('Not implemented'); }
}

module.exports = IProjectRepository;
