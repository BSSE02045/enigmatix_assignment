/**
 * Seeds demo users into the database with correctly bcrypt-hashed passwords.
 * Run AFTER you've created the database and run schema.sql:
 *   npm run seed
 *
 * All seeded accounts share the password:  Password123!
 * Uses the same PasswordHasher class the app itself uses, so hashes are
 * generated exactly the way AuthService expects.
 */
const pool = require('../src/infrastructure/database/connection');
const PasswordHasher = require('../src/infrastructure/security/PasswordHasher');

const DEMO_PASSWORD = 'Password123!';
const hasher = new PasswordHasher(10);

const users = [
  { name: 'Ayesha Khan',   email: 'admin@softwarehouse.com',       role: 'admin',       designation: 'System Administrator', team_id: null, company_name: null },
  { name: 'Hamza Tariq',   email: 'shareholder@softwarehouse.com', role: 'shareholder', designation: null,                   team_id: null, company_name: null },
  { name: 'Bilal Ahmed',   email: 'lead.frontend@softwarehouse.com', role: 'team_lead', designation: 'Frontend Lead',        team_id: 1,    company_name: null },
  { name: 'Sara Malik',    email: 'lead.backend@softwarehouse.com',  role: 'team_lead', designation: 'Backend Lead',         team_id: 2,    company_name: null },
  { name: 'Usman Raza',    email: 'employee1@softwarehouse.com',   role: 'employee',    designation: 'Frontend Developer',   team_id: 1,    company_name: null },
  { name: 'Zara Sheikh',   email: 'intern1@softwarehouse.com',     role: 'intern',      designation: 'Backend Intern',       team_id: 2,    company_name: null },
  { name: 'Global Retail Co.', email: 'client1@example.com',       role: 'client',      designation: null,                   team_id: null, company_name: 'Global Retail Co.' }
];

async function seed() {
  try {
    const password_hash = await hasher.hash(DEMO_PASSWORD);

    for (const u of users) {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [u.email]);
      if (existing.length > 0) {
        console.log(`Skipping ${u.email} (already exists)`);
        continue;
      }
      await pool.query(
        `INSERT INTO users (name, email, password_hash, role, designation, team_id, company_name)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [u.name, u.email, password_hash, u.role, u.designation, u.team_id, u.company_name]
      );
      console.log(`Created ${u.role}: ${u.email}`);
    }

    await pool.query(`UPDATE teams SET lead_id = (SELECT id FROM users WHERE email = 'lead.frontend@softwarehouse.com') WHERE name = 'Frontend'`);
    await pool.query(`UPDATE teams SET lead_id = (SELECT id FROM users WHERE email = 'lead.backend@softwarehouse.com') WHERE name = 'Backend'`);

    await pool.query(
      `UPDATE projects SET client_id = (SELECT id FROM users WHERE email = 'client1@example.com')
       WHERE name = 'E-Commerce Revamp' AND client_id IS NULL`
    );

    const [taskCount] = await pool.query('SELECT COUNT(*) AS c FROM tasks');
    if (taskCount[0].c === 0) {
      const [[project]] = await pool.query(`SELECT id FROM projects WHERE name = 'E-Commerce Revamp'`);
      const [[employee]] = await pool.query(`SELECT id FROM users WHERE email = 'employee1@softwarehouse.com'`);
      const [[intern]] = await pool.query(`SELECT id FROM users WHERE email = 'intern1@softwarehouse.com'`);
      const [[frontendLead]] = await pool.query(`SELECT id FROM users WHERE email = 'lead.frontend@softwarehouse.com'`);
      const [[backendLead]] = await pool.query(`SELECT id FROM users WHERE email = 'lead.backend@softwarehouse.com'`);

      await pool.query(
        `INSERT INTO tasks (title, description, project_id, team_id, assigned_to, assigned_by, status, priority, due_date) VALUES
         (?, ?, ?, 1, ?, ?, 'in_progress', 'high', '2026-08-10'),
         (?, ?, ?, 2, ?, ?, 'todo', 'medium', '2026-08-15')`,
        [
          'Build product listing page', 'Implement responsive product grid with filters', project.id, employee.id, frontendLead.id,
          'Design checkout API', 'Design REST endpoints for cart and checkout flow', project.id, intern.id, backendLead.id
        ]
      );
      console.log('Created 2 demo tasks');
    }

    console.log('\nSeed complete. Demo login password for every account: Password123!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
