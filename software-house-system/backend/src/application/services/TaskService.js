class TaskService {
  constructor(taskRepository) {
    this.taskRepository = taskRepository;
  }

  /** Same role-based visibility rules as before, now centralized in one place. */
  async listTasks(user) {
    if (user.isStaff()) return this.taskRepository.findAll({ assignedTo: user.id });
    if (user.isTeamLead()) return this.taskRepository.findAll({ teamId: user.teamId });
    if (user.isClientSide()) return this.taskRepository.findAll({ clientId: user.id });
    return this.taskRepository.findAll(); // admin / shareholder
  }

  async createTask(data, requestingUser) {
    const teamId = requestingUser.isTeamLead() ? requestingUser.teamId : (data.team_id || null);
    return this.taskRepository.create({
      title: data.title, description: data.description, projectId: data.project_id,
      teamId, assignedTo: data.assigned_to, assignedBy: requestingUser.id,
      priority: data.priority || 'medium', dueDate: data.due_date
    });
  }

  /** Uses the Task entity's own business rule to decide if this change is allowed. */
  async changeStatus(taskId, newStatus, requestingUser) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new Error('Task not found');

    task.changeStatus(newStatus, requestingUser); // throws if not permitted / invalid
    return this.taskRepository.updateStatus(taskId, newStatus);
  }

  async updateTask(id, changes) {
    const updated = await this.taskRepository.update(id, {
      title: changes.title, description: changes.description,
      assignedTo: changes.assigned_to, priority: changes.priority, dueDate: changes.due_date
    });
    if (!updated) throw new Error('Task not found');
    return updated;
  }

  async deleteTask(id) {
    const ok = await this.taskRepository.delete(id);
    if (!ok) throw new Error('Task not found');
    return true;
  }
}

module.exports = TaskService;
