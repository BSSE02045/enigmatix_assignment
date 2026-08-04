import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = {
  admin: 'Admin',
  shareholder: 'Shareholder',
  client: 'Client',
  buyer: 'Buyer',
  team_lead: 'Team Lead',
  staff: 'Staff',
  employee: 'Employee',
  intern: 'Intern'
};

function linkClass({ isActive }) {
  return `flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
    isActive ? 'bg-navy-hover text-white' : 'text-white/60 hover:text-white hover:bg-navy-light'
  }`;
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const showReports = ['intern', 'employee', 'staff', 'team_lead', 'admin'].includes(user.role);
  const showTeams = ['admin', 'shareholder', 'team_lead'].includes(user.role);
  const showProjects = ['admin', 'team_lead', 'shareholder', 'client', 'buyer'].includes(user.role);
  const showUsers = user.role === 'admin';

  return (
    <aside className="w-64 shrink-0 bg-navy min-h-screen flex flex-col">
      <div className="px-5 py-6 border-b border-white/10">
        <p className="font-display font-bold text-white text-lg tracking-tight">NEXUS</p>
        <p className="text-white/40 text-xs font-mono mt-0.5">SOFTWARE HOUSE OS</p>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
        <NavLink to="/tasks" className={linkClass}>Tasks</NavLink>
        {showReports && <NavLink to="/reports" className={linkClass}>Daily Reports</NavLink>}
        {showTeams && <NavLink to="/teams" className={linkClass}>Teams</NavLink>}
        {showProjects && <NavLink to="/projects" className={linkClass}>Projects</NavLink>}
        {showUsers && <NavLink to="/users" className={linkClass}>Users</NavLink>}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-white text-sm font-medium truncate">{user.name}</p>
        <p className="text-white/40 text-xs font-mono uppercase tracking-wide mt-0.5">{ROLE_LABELS[user.role] || user.role}</p>
        <button
          onClick={logout}
          className="mt-3 w-full text-left text-xs text-white/50 hover:text-white transition-colors"
        >
          Sign out →
        </button>
      </div>
    </aside>
  );
}

export { ROLE_LABELS };
