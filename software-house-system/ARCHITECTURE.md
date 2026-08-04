# Architecture

This backend follows **Clean Architecture** with explicit **OOP** and
**SOLID** principles, using the **Repository** and **Service** patterns and
manual **Dependency Injection**.

## Layers (dependency direction flows inward → outward is forbidden)

```
domain/            ← innermost. Zero dependencies on anything else in the app.
  entities/           Plain OOP classes: User, Task, Project, Team, DailyReport.
                       Hold business rules (e.g. Task.canChangeStatus()).
  repositories/        Abstract interfaces (IUserRepository, ITaskRepository...).
                       Define WHAT persistence must do, not HOW.

application/        ← depends only on domain/.
  services/            AuthService, TaskService, ProjectService, etc.
                       All business logic / orchestration lives here.
                       Receive repository ABSTRACTIONS via constructor —
                       never a concrete MySQL class.

infrastructure/     ← depends on domain/ (implements its interfaces).
  database/             The one shared MySQL connection pool.
  repositories/         MySQLUserRepository extends IUserRepository, etc.
                       All SQL lives here and nowhere else.
  security/             PasswordHasher (wraps bcrypt), TokenService (wraps jwt).

presentation/        ← depends on application/.
  controllers/          Thin HTTP adapters: parse req, call a service, send res.
                       No business logic.
  routes/               Express route definitions, wired to controllers.
  middleware/            authenticate/authorize + central error handler.

container.js          The Composition Root — the ONLY file that does `new`
                       on concrete classes and wires everything together.
server.js              Boots Express using what container.js built.
```

## Why this satisfies the requirements

**OOP** — Every entity (`User`, `Task`, `Project`, `Team`, `DailyReport`) is a
real class with its own invariants and behaviour (e.g. `Task` validates its
own status, `Project.isVisibleTo()` decides its own visibility rule) instead
of being a plain data bag passed around and validated ad hoc in controllers.

**SOLID**
- **S — Single Responsibility**: a repository only talks to the DB, a
  service only holds business rules, a controller only translates HTTP.
  Change how passwords are hashed and you touch `PasswordHasher.js` only.
- **O — Open/Closed**: adding a PostgreSQL backend means writing a new
  `PostgresUserRepository` that implements `IUserRepository` — no existing
  service or controller code changes.
- **L — Liskov Substitution**: anything extending `IUserRepository` (a
  MySQL one, a Postgres one, an in-memory fake for tests — see
  `test/smoke.js`) can be substituted wherever `IUserRepository` is expected.
- **I — Interface Segregation**: each repository interface only exposes the
  operations that layer actually needs (no bloated "God repository").
- **D — Dependency Inversion**: `AuthService` depends on the *abstraction*
  `IUserRepository`, never on `MySQLUserRepository` directly. The concrete
  wiring only happens once, in `container.js`.

**Clean Architecture** — dependencies only point inward. `domain/` has zero
imports from anywhere else in the app. `application/` imports only
`domain/`. `infrastructure/` and `presentation/` are the outermost,
replaceable layers — you could delete `presentation/` entirely (e.g. swap
Express for a CLI or a GraphQL server) and every business rule in
`domain/` + `application/` still works unchanged.

**Repository pattern** — `IUserRepository`, `ITaskRepository`, etc.
abstract persistence away from business logic.

**Service pattern** — `AuthService`, `TaskService`, `ProjectService`,
`TeamService`, `ReportService`, `UserService` each own one area of business
logic and are the only place that area's rules are enforced.

**Dependency Injection** — every class receives its dependencies through
its constructor (`new TaskService(taskRepository)`,
`new AuthService(userRepository, passwordHasher, tokenService)`). Nothing
reaches out and constructs its own dependencies. `container.js` is the
single "composition root" where the object graph is actually built.

## Verifying it without installing anything

`backend/test/smoke.js` exercises real domain and application logic
(entity business rules + services) using lightweight in-memory fakes in
place of MySQL/bcrypt/JWT, so it runs with **zero npm packages installed**:

```bash
node test/smoke.js
```

This is a good thing to point to in a viva/demo — it proves the business
logic (`Task.canChangeStatus`, `Project.isVisibleTo`, `AuthService.login`,
etc.) is correct independent of the database or web framework, which is
the entire point of Clean Architecture.
