const express = require('express');

/**
 * Builds and wires all route groups. Takes the fully-constructed
 * controllers and middleware from the container (composition root) —
 * this file never instantiates anything itself, it only assembles.
 */
function buildRouter({ controllers, authenticate, authorize }) {
  const router = express.Router();
  const { authController, userController, teamController, projectController, taskController, reportController } = controllers;

  // ---- Auth ----
  router.post('/auth/register', authController.register);
  router.post('/auth/login', authController.login);
  router.get('/auth/me', authenticate, authController.me);

  // ---- Users ----
  router.get('/users', authenticate, authorize('admin', 'shareholder', 'team_lead'), userController.list);
  router.get('/users/:id', authenticate, userController.getById);
  router.put('/users/:id', authenticate, authorize('admin'), userController.update);
  router.delete('/users/:id', authenticate, authorize('admin'), userController.deactivate);

  // ---- Teams ----
  router.get('/teams', authenticate, teamController.list);
  router.get('/teams/:id/members', authenticate, teamController.members);
  router.post('/teams', authenticate, authorize('admin'), teamController.create);
  router.put('/teams/:id', authenticate, authorize('admin'), teamController.update);

  // ---- Projects ----
  router.get('/projects', authenticate, projectController.list);
  router.get('/projects/:id', authenticate, projectController.getById);
  router.post('/projects', authenticate, authorize('admin', 'team_lead'), projectController.create);
  router.put('/projects/:id', authenticate, authorize('admin', 'team_lead'), projectController.update);

  // ---- Tasks ----
  router.get('/tasks', authenticate, taskController.list);
  router.post('/tasks', authenticate, authorize('admin', 'team_lead'), taskController.create);
  router.put('/tasks/:id/status', authenticate, taskController.updateStatus);
  router.put('/tasks/:id', authenticate, authorize('admin', 'team_lead'), taskController.update);
  router.delete('/tasks/:id', authenticate, authorize('admin', 'team_lead'), taskController.remove);

  // ---- Reports ----
  router.post('/reports', authenticate, authorize('admin', 'team_lead', 'staff', 'employee', 'intern'), reportController.submit);
  router.get('/reports', authenticate, reportController.list);

  router.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

  return router;
}

module.exports = buildRouter;
