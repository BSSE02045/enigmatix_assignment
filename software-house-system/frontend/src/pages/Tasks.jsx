import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';

const STATUS_OPTIONS = ['todo', 'in_progress', 'review', 'done'];

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', assigned_to: '', priority: 'medium', due_date: '' });
  const [submitting, setSubmitting] = useState(false);

  const canCreate = ['admin', 'team_lead'].includes(user.role);

  const loadTasks = () => {
    setLoading(true);
    client.get('/tasks').then((res) => setTasks(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTasks();
    if (canCreate && user.team_id) {
      client.get(`/teams/${user.team_id}/members`).then((res) => setTeamMembers(res.data));
    } else if (canCreate) {
      client.get('/users').then((res) => setTeamMembers(res.data));
    }
  }, []);

  const handleStatusChange = async (taskId, status) => {
    // Optimistic update so the UI feels instant
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
    try {
      await client.put(`/tasks/${taskId}/status`, { status });
    } catch (err) {
      loadTasks(); // revert on failure
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await client.post('/tasks', form);
      setForm({ title: '', description: '', assigned_to: '', priority: 'medium', due_date: '' });
      setShowForm(false);
      loadTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Tasks" subtitle={canCreate ? 'Assign and track your team\u2019s work.' : 'Your assigned work.'}>
      {canCreate && (
        <div className="mb-6">
          <button
            onClick={() => setShowForm((s) => !s)}
            className="text-sm font-medium bg-navy text-white px-4 py-2 rounded-md hover:bg-navy-hover transition-colors"
          >
            {showForm ? 'Cancel' : '+ New task'}
          </button>

          {showForm && (
            <form onSubmit={handleCreate} className="mt-4 bg-surface border border-line rounded-lg p-5 grid grid-cols-2 gap-4">
              <input
                required
                placeholder="Task title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="col-span-2 px-3 py-2 rounded-md border border-line text-sm outline-none focus:border-accent"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="col-span-2 px-3 py-2 rounded-md border border-line text-sm outline-none focus:border-accent"
                rows={2}
              />
              <select
                value={form.assigned_to}
                onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                className="px-3 py-2 rounded-md border border-line text-sm outline-none focus:border-accent"
              >
                <option value="">Assign to…</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="px-3 py-2 rounded-md border border-line text-sm outline-none focus:border-accent"
              >
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
                <option value="urgent">Urgent</option>
              </select>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="px-3 py-2 rounded-md border border-line text-sm outline-none focus:border-accent"
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-accent text-white text-sm font-medium rounded-md px-4 py-2 hover:bg-accent-dark transition-colors disabled:opacity-50"
              >
                {submitting ? 'Creating…' : 'Create task'}
              </button>
            </form>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-muted text-sm font-mono">LOADING…</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-muted">No tasks yet.</p>
      ) : (
        <div className="bg-surface border border-line rounded-lg divide-y divide-line">
          {tasks.map((t) => (
            <div key={t.id} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{t.title}</p>
                {t.description && <p className="text-xs text-muted mt-0.5 truncate max-w-md">{t.description}</p>}
                <p className="text-xs text-muted mt-1 font-mono">
                  {t.assigned_to_name ? `→ ${t.assigned_to_name}` : 'Unassigned'}
                  {t.project_name ? ` · ${t.project_name}` : ''}
                  {t.due_date ? ` · Due ${t.due_date}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <PriorityBadge priority={t.priority} />
                <select
                  value={t.status}
                  onChange={(e) => handleStatusChange(t.id, e.target.value)}
                  className="text-xs font-mono uppercase border border-line rounded px-2 py-1 outline-none focus:border-accent"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
