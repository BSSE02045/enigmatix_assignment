import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function DailyReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ report_date: todayISO(), summary: '', hours_worked: '', blockers: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const canSubmit = ['intern', 'employee', 'staff', 'team_lead', 'admin'].includes(user.role);

  const loadReports = () => {
    setLoading(true);
    client.get('/reports').then((res) => setReports(res.data)).finally(() => setLoading(false));
  };

  useEffect(loadReports, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await client.post('/reports', form);
      setMessage('Report saved.');
      setForm({ report_date: todayISO(), summary: '', hours_worked: '', blockers: '' });
      loadReports();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to save report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Daily Reports" subtitle="End-of-day summaries of what got done.">
      {canSubmit && (
        <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-lg p-5 mb-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Date</label>
              <input
                type="date"
                value={form.report_date}
                onChange={(e) => setForm({ ...form, report_date: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-line text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Hours worked</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={form.hours_worked}
                onChange={(e) => setForm({ ...form, hours_worked: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-line text-sm outline-none focus:border-accent"
                placeholder="8"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1">What did you work on?</label>
            <textarea
              required
              rows={3}
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-line text-sm outline-none focus:border-accent"
              placeholder="Built the product listing grid, fixed 2 filter bugs…"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1">Any blockers? (optional)</label>
            <input
              value={form.blockers}
              onChange={(e) => setForm({ ...form, blockers: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-line text-sm outline-none focus:border-accent"
              placeholder="Waiting on API keys from client"
            />
          </div>

          {message && <p className="text-sm text-accent">{message}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-navy text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-navy-hover transition-colors disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Submit report'}
          </button>
        </form>
      )}

      <h2 className="font-display font-semibold text-ink mb-3">
        {user.role === 'team_lead' ? "Team's reports" : user.role === 'admin' ? 'All reports' : 'Your reports'}
      </h2>

      {loading ? (
        <p className="text-muted text-sm font-mono">LOADING…</p>
      ) : reports.length === 0 ? (
        <p className="text-sm text-muted">No reports submitted yet.</p>
      ) : (
        <div className="bg-surface border border-line rounded-lg divide-y divide-line">
          {reports.map((r) => (
            <div key={r.id} className="px-5 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink">{r.user_name}</p>
                <p className="text-xs font-mono text-muted">{r.report_date} · {r.hours_worked}h</p>
              </div>
              <p className="text-sm text-ink mt-1.5">{r.summary}</p>
              {r.blockers && <p className="text-xs text-warn mt-1.5">Blocker: {r.blockers}</p>}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
