class ITaskRepository {
  async findAll({ assignedTo, teamId, clientId } = {}) { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
  async create(task) { throw new Error('Not implemented'); }
  async update(id, changes) { throw new Error('Not implemented'); }
  async updateStatus(id, status) { throw new Error('Not implemented'); }
  async delete(id) { throw new Error('Not implemented'); }
}

module.exports = ITaskRepository;
