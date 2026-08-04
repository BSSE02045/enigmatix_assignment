import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-surface border border-line rounded-lg p-5">
      <p className="text-xs font-mono uppercase tracking-wide text-muted">{label}</p>
      <p className={`font-display text-3xl font-semibold mt-2 ${accent || 'text-ink'}`}>{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const showProjects = ['admin', 'team_lead', 'shareholder', 'client', 'buyer'].includes(user.role);

  useEffect(() => {
    const requests = [client.get('/tasks')];
    if (showProjects) requests.push(client.get('/projects'));

    Promise.all(requests)
      .then(([taskRes, projectRes]) => {
        setTasks(taskRes.data);
        if (projectRes) setProjects(projectRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const counts = tasks.reduce(
    (acc, t) => ({ ...acc, [t.status]: (acc[t.status] || 0) + 1 }),
    {}
  );

  return (
    <Layout title={`Welcome, ${user.name.split(' ')[0]}`} subtitle="Here's what's happening across your work today.">
      {loading ? (
        <p className="text-muted text-sm font-mono">LOADING…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="To-do" value={counts.todo || 0} />
            <StatCard label="In progress" value={counts.in_progress || 0} accent="text-accent" />
            <StatCard label="In review" value={counts.review || 0} accent="text-amber" />
            <StatCard label="Done" value={counts.done || 0} accent="text-good" />
          </div>

          {showProjects && projects.length > 0 && (
            <div className="mb-8">
              <h2 className="font-display font-semibold text-ink mb-3">
                {['client', 'buyer'].includes(user.role) ? 'Your projects' : 'Active projects'}
              </h2>
              <div className="bg-surface border border-line rounded-lg divide-y divide-line">
                {projects.map((p) => (
                  <div key={p.id} className="px-5 py-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-ink">{p.name}</p>
                      {p.client_name && <p className="text-xs text-muted mt-0.5">{p.client_name}</p>}
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="font-display font-semibold text-ink mb-3">
              {['intern', 'employee', 'staff'].includes(user.role) ? 'Your tasks' : 'Tasks'}
            </h2>
            {tasks.length === 0 ? (
              <p className="text-sm text-muted">No tasks to show yet.</p>
            ) : (
              <div className="bg-surface border border-line rounded-lg divide-y divide-line">
                {tasks.slice(0, 8).map((t) => (
                  <div key={t.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{t.title}</p>
                      <p className="text-xs text-muted mt-0.5">
                        {t.assigned_to_name ? `Assigned to ${t.assigned_to_name}` : 'Unassigned'}
                        {t.due_date ? ` · Due ${t.due_date}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
