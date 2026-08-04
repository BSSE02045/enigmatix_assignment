# Nexus — Software House Management System

A full-stack web app for running a software house: interns, employees, staff,
team leads, clients/buyers, and shareholders each get a role-appropriate view
of teams, projects, tasks, and daily work reports.

- **Backend:** Node.js + Express + MySQL, built with **Clean Architecture** —
  see [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full breakdown of the
  OOP design, SOLID principles, and the Repository/Service/DI patterns used.
- **Frontend:** React (Vite) + Tailwind CSS

---

## 1. Project structure

```
software-house-system/
├── ARCHITECTURE.md            # OOP / SOLID / Clean Architecture write-up
├── backend/
│   ├── src/
│   │   ├── domain/               # Entities + repository interfaces (no deps on anything else)
│   │   │   ├── entities/            User, Task, Project, Team, DailyReport
│   │   │   └── repositories/        IUserRepository, ITaskRepository, ...
│   │   ├── application/          # Business logic — depends only on domain/
│   │   │   └── services/            AuthService, TaskService, ProjectService, ...
│   │   ├── infrastructure/       # Concrete implementations — depends on domain/
│   │   │   ├── database/            MySQL connection pool
│   │   │   ├── repositories/        MySQLUserRepository, MySQLTaskRepository, ...
│   │   │   └── security/            PasswordHasher (bcrypt), TokenService (JWT)
│   │   ├── presentation/         # HTTP layer — depends on application/
│   │   │   ├── controllers/         Thin request/response adapters
│   │   │   ├── routes/               Express route wiring
│   │   │   └── middleware/           authenticate/authorize, error handler
│   │   └── container.js          # Composition root — wires every layer together (DI)
│   ├── db/schema.sql          # Table definitions
│   ├── db/seed.js             # Creates demo accounts with hashed passwords
│   ├── test/smoke.js          # Business-logic tests, runs with zero npm installs
│   ├── server.js              # App entry point (uses the container)
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/client.js     # Axios instance (attaches JWT to every request)
    │   ├── context/AuthContext.jsx
    │   ├── components/       # Sidebar, Layout, StatusBadge, ProtectedRoute
    │   ├── pages/             # Login, Dashboard, Tasks, DailyReports, Teams, Projects, Users
    │   └── App.jsx            # Routes, one per page, guarded by role
    └── .env.example
```

## 2. Roles supported

| Role | Can do |
|---|---|
| `admin` | Everything — manage users, teams, projects, tasks |
| `shareholder` | Read-only view of teams, projects, and company-wide tasks |
| `team_lead` | Manage their own team's tasks, assign work, view team reports |
| `staff` / `employee` / `intern` | View & update own tasks, submit daily reports |
| `client` / `buyer` | View their own project(s) and status only |

Role and permission checks are enforced **server-side** in
`backend/middleware/auth.js` and each controller — the frontend hiding a
button is only a convenience, not the actual security boundary.

---

## 3. Setting up the database (MySQL)

1. Make sure MySQL is installed and running locally (or use a hosted MySQL instance).
2. Log in and run the schema:
   ```bash
   mysql -u root -p < backend/db/schema.sql
   ```
   This creates the `software_house_db` database and all tables (`teams`,
   `users`, `projects`, `tasks`, `daily_reports`), plus one demo project.

## 4. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your real MySQL credentials and a random `JWT_SECRET`
(any long random string — e.g. run `openssl rand -hex 32`).

Optional but recommended — sanity-check the core business logic (entities +
services) before touching the database at all:

```bash
npm test
```

Seed demo accounts (creates properly bcrypt-hashed passwords — don't use the
raw SQL INSERT approach for real passwords):

```bash
npm run seed
```

This creates one account per role, e.g.:
- `admin@softwarehouse.com`
- `shareholder@softwarehouse.com`
- `lead.frontend@softwarehouse.com` / `lead.backend@softwarehouse.com`
- `employee1@softwarehouse.com`
- `intern1@softwarehouse.com`
- `client1@example.com`

**Every seeded account uses the password `Password123!`**

Start the server:

```bash
npm run dev      # with auto-restart (nodemon)
# or
npm start
```

The API runs on `http://localhost:5000` by default. Check it's alive:

```bash
curl http://localhost:5000/api/health
```

## 5. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173` and log in with any of the seeded accounts above.

---

## 6. API overview

All routes except `/api/auth/register` and `/api/auth/login` require a
`Authorization: Bearer <token>` header (the token comes back from login).

| Method | Route | Who |
|---|---|---|
| POST | `/api/auth/register` | anyone |
| POST | `/api/auth/login` | anyone |
| GET | `/api/auth/me` | logged-in user |
| GET | `/api/users` | admin, shareholder, team_lead (own team only) |
| PUT | `/api/users/:id` | admin |
| DELETE | `/api/users/:id` | admin (soft-deactivate) |
| GET | `/api/teams` | logged-in user |
| GET | `/api/teams/:id/members` | logged-in user |
| POST / PUT | `/api/teams` | admin |
| GET | `/api/projects` | logged-in user (clients see only their own) |
| POST / PUT | `/api/projects` | admin, team_lead |
| GET | `/api/tasks` | logged-in user (scoped by role) |
| POST | `/api/tasks` | admin, team_lead |
| PUT | `/api/tasks/:id/status` | task owner, that team's lead, or admin |
| PUT / DELETE | `/api/tasks/:id` | admin, team_lead |
| GET | `/api/reports` | logged-in user (scoped by role) |
| POST | `/api/reports` | staff roles + team_lead + admin |

## 7. What to build on next

This covers the core assignment scope. Natural next steps if you want to
extend it further:
- Email notifications when a task is assigned or a deadline is near
- File attachments on tasks / daily reports
- A calendar view of deadlines
- Pagination on the tasks/reports/users lists once data grows
- Refresh tokens (currently the JWT just expires after `JWT_EXPIRES_IN`)

## 8. Deploying

- **Database:** any managed MySQL (PlanetScale, Railway, AWS RDS, etc.)
- **Backend:** Render, Railway, Fly.io, or a university VM — just set the
  same env vars from `.env.example`
- **Frontend:** Vercel, Netlify, or `npm run build` and serve the `dist/`
  folder from any static host — set `VITE_API_URL` to your deployed backend URL
