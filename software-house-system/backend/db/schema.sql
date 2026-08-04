-- Software House Management System
-- MySQL schema

CREATE DATABASE IF NOT EXISTS software_house_db;
USE software_house_db;

-- ============ TEAMS ============
CREATE TABLE teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,          -- e.g. Frontend, Backend, QA, Design, DevOps
  description VARCHAR(255),
  lead_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ USERS ============
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','shareholder','client','buyer','team_lead','staff','employee','intern') NOT NULL,
  designation VARCHAR(100) DEFAULT NULL,
  team_id INT DEFAULT NULL,
  company_name VARCHAR(150) DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

ALTER TABLE teams
  ADD CONSTRAINT fk_teams_lead FOREIGN KEY (lead_id) REFERENCES users(id) ON DELETE SET NULL;

-- ============ PROJECTS ============
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  client_id INT DEFAULT NULL,
  status ENUM('planning','in_progress','on_hold','completed','cancelled') DEFAULT 'planning',
  start_date DATE,
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_projects_client FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============ TASKS ============
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  project_id INT DEFAULT NULL,
  team_id INT DEFAULT NULL,
  assigned_to INT DEFAULT NULL,
  assigned_by INT DEFAULT NULL,
  status ENUM('todo','in_progress','review','done') DEFAULT 'todo',
  priority ENUM('low','medium','high','urgent') DEFAULT 'medium',
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  CONSTRAINT fk_tasks_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
  CONSTRAINT fk_tasks_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_tasks_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============ DAILY REPORTS ============
CREATE TABLE daily_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  report_date DATE NOT NULL,
  summary TEXT NOT NULL,
  hours_worked DECIMAL(4,1) DEFAULT 0,
  blockers TEXT,
  task_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
  UNIQUE KEY unique_user_date_task (user_id, report_date, task_id)
);

-- ============ INDEXES ============
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_team ON tasks(team_id);
CREATE INDEX idx_reports_user_date ON daily_reports(user_id, report_date);
CREATE INDEX idx_users_role ON users(role);

-- ============ SEED DATA ============
-- NOTE: password_hash values below are placeholders.
-- Run `npm run seed` (backend/db/seed.js) instead of this file directly —
-- it hashes real passwords with bcrypt and inserts this same data safely.

INSERT INTO teams (name, description) VALUES
  ('Frontend', 'UI/UX implementation team'),
  ('Backend', 'Server, API and database team'),
  ('QA', 'Quality assurance and testing team'),
  ('Design', 'Product and graphic design team');

INSERT INTO projects (name, description, status, start_date, due_date) VALUES
  ('E-Commerce Revamp', 'Full redesign and rebuild of the client storefront', 'in_progress', '2026-06-01', '2026-09-30');
