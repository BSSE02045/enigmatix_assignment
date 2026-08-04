/**
 * container.js — the Composition Root.
 *
 * This is the ONE place in the whole app where concrete classes are
 * instantiated and wired to each other. Every other file receives its
 * dependencies through its constructor and never does `new SomeConcreteThing()`
 * itself. This is what makes the Dependency Inversion Principle real:
 * high-level modules (services) depend only on abstractions (repository
 * interfaces); this file decides which concrete implementation fulfils
 * each abstraction.
 *
 * Want to swap MySQL for PostgreSQL later? Write PostgresUserRepository
 * (implementing IUserRepository) and change ONE line below — no service,
 * controller, or route needs to change.
 */
require('dotenv').config();
const pool = require('./infrastructure/database/connection');

// Infrastructure
const PasswordHasher = require('./infrastructure/security/PasswordHasher');
const TokenService = require('./infrastructure/security/TokenService');
const MySQLUserRepository = require('./infrastructure/repositories/MySQLUserRepository');
const MySQLTeamRepository = require('./infrastructure/repositories/MySQLTeamRepository');
const MySQLProjectRepository = require('./infrastructure/repositories/MySQLProjectRepository');
const MySQLTaskRepository = require('./infrastructure/repositories/MySQLTaskRepository');
const MySQLReportRepository = require('./infrastructure/repositories/MySQLReportRepository');

// Application
const AuthService = require('./application/services/AuthService');
const UserService = require('./application/services/UserService');
const TeamService = require('./application/services/TeamService');
const ProjectService = require('./application/services/ProjectService');
const TaskService = require('./application/services/TaskService');
const ReportService = require('./application/services/ReportService');

// Presentation
const AuthController = require('./presentation/controllers/AuthController');
const UserController = require('./presentation/controllers/UserController');
const TeamController = require('./presentation/controllers/TeamController');
const ProjectController = require('./presentation/controllers/ProjectController');
const TaskController = require('./presentation/controllers/TaskController');
const ReportController = require('./presentation/controllers/ReportController');
const makeAuthMiddleware = require('./presentation/middleware/auth.middleware');

function buildContainer() {
  // --- Infrastructure: concrete implementations of domain abstractions ---
  const passwordHasher = new PasswordHasher(10);
  const tokenService = new TokenService(process.env.JWT_SECRET, process.env.JWT_EXPIRES_IN || '7d');

  const userRepository = new MySQLUserRepository(pool);
  const teamRepository = new MySQLTeamRepository(pool);
  const projectRepository = new MySQLProjectRepository(pool);
  const taskRepository = new MySQLTaskRepository(pool);
  const reportRepository = new MySQLReportRepository(pool);

  // --- Application: services receive abstractions, not concretions ---
  const authService = new AuthService(userRepository, passwordHasher, tokenService);
  const userService = new UserService(userRepository);
  const teamService = new TeamService(teamRepository);
  const projectService = new ProjectService(projectRepository);
  const taskService = new TaskService(taskRepository);
  const reportService = new ReportService(reportRepository);

  // --- Presentation: controllers receive services ---
  const controllers = {
    authController: new AuthController(authService),
    userController: new UserController(userService),
    teamController: new TeamController(teamService),
    projectController: new ProjectController(projectService),
    taskController: new TaskController(taskService),
    reportController: new ReportController(reportService)
  };

  const { authenticate, authorize } = makeAuthMiddleware(tokenService);

  return { controllers, authenticate, authorize, pool };
}

module.exports = buildContainer;
