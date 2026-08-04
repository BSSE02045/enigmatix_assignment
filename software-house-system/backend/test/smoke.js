/**
 * Runtime smoke test — exercises real domain + application logic using
 * in-memory fakes in place of MySQL/bcrypt/JWT (so it runs with zero
 * npm packages installed). This is NOT the app's test suite, just a
 * one-off sanity check before delivery.
 */
const assert = require('assert');
const { User } = require('../src/domain/entities/User');
const { Task } = require('../src/domain/entities/Task');
const { Project } = require('../src/domain/entities/Project');
const AuthService = require('../src/application/services/AuthService');
const TaskService = require('../src/application/services/TaskService');
const ProjectService = require('../src/application/services/ProjectService');

let passed = 0;
function check(label, fn) {
  try { fn(); console.log(`  OK  ${label}`); passed++; }
  catch (e) { console.log(`FAIL  ${label} -> ${e.message}`); process.exitCode = 1; }
}

console.log('--- Domain entity business rules ---');

check('Task.canChangeStatus: owner can change their own task', () => {
  const task = new Task({ id: 1, title: 'x', assignedTo: 5, teamId: 2 });
  const owner = new User({ id: 5, name: 'Owner', email: 'o@x.com', role: 'employee', teamId: 2 });
  assert.strictEqual(task.canChangeStatus(owner), true);
});

check('Task.canChangeStatus: unrelated employee cannot', () => {
  const task = new Task({ id: 1, title: 'x', assignedTo: 5, teamId: 2 });
  const stranger = new User({ id: 99, name: 'Stranger', email: 's@x.com', role: 'employee', teamId: 9 });
  assert.strictEqual(task.canChangeStatus(stranger), false);
});

check('Task.canChangeStatus: team lead of that team can', () => {
  const task = new Task({ id: 1, title: 'x', assignedTo: 5, teamId: 2 });
  const lead = new User({ id: 7, name: 'Lead', email: 'l@x.com', role: 'team_lead', teamId: 2 });
  assert.strictEqual(task.canChangeStatus(lead), true);
});

check('Task.changeStatus throws on invalid status', () => {
  const task = new Task({ id: 1, title: 'x', assignedTo: 5, teamId: 2 });
  const owner = new User({ id: 5, name: 'Owner', email: 'o@x.com', role: 'employee', teamId: 2 });
  assert.throws(() => task.changeStatus('bogus_status', owner));
});

check('Project.isVisibleTo: client sees only their own project', () => {
  const project = new Project({ id: 1, name: 'P', clientId: 10 });
  const owningClient = new User({ id: 10, name: 'C', email: 'c@x.com', role: 'client' });
  const otherClient = new User({ id: 11, name: 'C2', email: 'c2@x.com', role: 'client' });
  assert.strictEqual(project.isVisibleTo(owningClient), true);
  assert.strictEqual(project.isVisibleTo(otherClient), false);
});

check('User.canManageTeam: admin manages any team, lead only their own', () => {
  const admin = new User({ id: 1, name: 'A', email: 'a@x.com', role: 'admin' });
  const lead = new User({ id: 2, name: 'L', email: 'l@x.com', role: 'team_lead', teamId: 3 });
  assert.strictEqual(admin.canManageTeam(999), true);
  assert.strictEqual(lead.canManageTeam(3), true);
  assert.strictEqual(lead.canManageTeam(4), false);
});

console.log('--- Application services (with fake repositories) ---');

// Fake repository/hasher/token implementations conforming to the same interfaces
function makeFakeUserRepo(seedUsers = []) {
  const rows = [...seedUsers];
  return {
    async findByEmail(email) { return rows.find((u) => u.email === email) || null; },
    async findById(id) { return rows.find((u) => u.id === id) || null; },
    async create(u) {
      const created = new User({ ...u, id: rows.length + 1 });
      rows.push(created);
      return created;
    }
  };
}
const fakeHasher = { async hash(pw) { return `hashed(${pw})`; }, async compare(pw, hash) { return hash === `hashed(${pw})`; } };
const fakeTokens = { sign(payload) { return `token(${payload.email})`; } };

(async () => {
  await (async () => {
    const repo = makeFakeUserRepo();
    const auth = new AuthService(repo, fakeHasher, fakeTokens);
    const { user, token } = await auth.register({ name: 'Ali', email: 'ali@x.com', password: 'secret123', role: 'employee' });
    check('AuthService.register creates a user + token', () => {
      assert.strictEqual(user.email, 'ali@x.com');
      assert.strictEqual(token, 'token(ali@x.com)');
    });

    const login = await auth.login('ali@x.com', 'secret123');
    check('AuthService.login succeeds with correct password', () => {
      assert.strictEqual(login.user.email, 'ali@x.com');
    });

    check('AuthService.login rejects wrong password', async () => {
      let threw = false;
      try { await auth.login('ali@x.com', 'wrongpw'); } catch (e) { threw = true; }
      assert.strictEqual(threw, true);
    });
  })();

  const fakeTaskRepo = {
    tasks: [new Task({ id: 1, title: 'Fix bug', assignedTo: 5, teamId: 2, status: 'todo' })],
    async findById(id) { return this.tasks.find((t) => t.id === id); },
    async updateStatus(id, status) {
      const t = this.tasks.find((x) => x.id === id);
      t.status = status;
      return t;
    }
  };
  const taskService = new TaskService(fakeTaskRepo);
  const employee = new User({ id: 5, name: 'E', email: 'e@x.com', role: 'employee', teamId: 2 });
  const updated = await taskService.changeStatus(1, 'in_progress', employee);
  check('TaskService.changeStatus updates via the entity rule', () => {
    assert.strictEqual(updated.status, 'in_progress');
  });

  const stranger = new User({ id: 999, name: 'S', email: 's@x.com', role: 'employee', teamId: 8 });
  check('TaskService.changeStatus rejects unauthorized user', async () => {
    let threw = false;
    try { await taskService.changeStatus(1, 'done', stranger); } catch (e) { threw = true; }
    assert.strictEqual(threw, true);
  });

  console.log(`\n${passed} checks passed.`);
})();
