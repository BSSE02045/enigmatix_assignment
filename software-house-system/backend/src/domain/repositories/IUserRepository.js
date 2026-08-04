/**
 * IUserRepository — abstraction (contract) for user persistence.
 *
 * This is the core of Dependency Inversion: the application layer
 * (services) will depend on THIS interface, never on a concrete
 * database implementation. Infrastructure classes implement it.
 * Any class extending this can be swapped in — MySQL today,
 * PostgreSQL or an in-memory fake for testing tomorrow — with
 * zero changes to business logic.
 */
class IUserRepository {
  async findById(id) { throw new Error('Not implemented'); }
  async findByEmail(email) { throw new Error('Not implemented'); }
  async findAll({ teamId } = {}) { throw new Error('Not implemented'); }
  async create(user) { throw new Error('Not implemented'); }
  async update(id, changes) { throw new Error('Not implemented'); }
  async deactivate(id) { throw new Error('Not implemented'); }
}

module.exports = IUserRepository;
