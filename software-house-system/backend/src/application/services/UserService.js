class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /** Company-wide roles see everyone; a team lead only sees their own team. */
  async listUsers(requestingUser) {
    if (requestingUser.hasCompanyWideVisibility()) {
      const users = await this.userRepository.findAll();
      return users.map((u) => u.toPublicJSON());
    }
    if (requestingUser.isTeamLead()) {
      const users = await this.userRepository.findAll({ teamId: requestingUser.teamId });
      return users.map((u) => u.toPublicJSON());
    }
    throw new Error('You do not have permission to list users');
  }

  async getUser(id) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error('User not found');
    return user.toPublicJSON();
  }

  async updateUser(id, changes) {
    const updated = await this.userRepository.update(id, changes);
    if (!updated) throw new Error('User not found');
    return updated.toPublicJSON();
  }

  async deactivateUser(id) {
    const ok = await this.userRepository.deactivate(id);
    if (!ok) throw new Error('User not found');
    return true;
  }
}

module.exports = UserService;
