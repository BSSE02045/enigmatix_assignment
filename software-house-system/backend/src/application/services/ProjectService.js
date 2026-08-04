const { Project } = require('../../domain/entities/Project');

class ProjectService {
  constructor(projectRepository) {
    this.projectRepository = projectRepository;
  }

  /** Business rule enforced here, not in the controller: clients only see their own projects. */
  async listProjects(requestingUser) {
    if (requestingUser.isClientSide()) {
      return this.projectRepository.findAll({ clientId: requestingUser.id });
    }
    return this.projectRepository.findAll();
  }

  async getProject(id, requestingUser) {
    const project = await this.projectRepository.findById(id);
    if (!project) throw new Error('Project not found');

    const entity = new Project({
      id: project.id, name: project.name, description: project.description, clientId: project.clientId,
      status: project.status, startDate: project.startDate, dueDate: project.dueDate
    });
    if (!entity.isVisibleTo(requestingUser)) throw new Error('You do not have access to this project');

    const taskBreakdown = await this.projectRepository.getTaskBreakdown(id);
    return { ...project, taskBreakdown };
  }

  async createProject(data) {
    return this.projectRepository.create({
      name: data.name, description: data.description, clientId: data.client_id,
      status: data.status || 'planning', startDate: data.start_date, dueDate: data.due_date
    });
  }

  async updateProject(id, changes) {
    const updated = await this.projectRepository.update(id, changes);
    if (!updated) throw new Error('Project not found');
    return updated;
  }
}

module.exports = ProjectService;
