import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/projects').then((res) => setProjects(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <Layout
      title="Projects"
      subtitle={['client', 'buyer'].includes(user.role) ? 'Status of your project(s).' : 'All active engagements.'}
    >
      {loading ? (
        <p className="text-muted text-sm font-mono">LOADING…</p>
      ) : projects.length === 0 ? (
        <p className="text-sm text-muted">No projects yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="bg-surface border border-line rounded-lg p-5">
              <div className="flex items-start justify-between mb-2">
                <p className="font-display font-semibold text-ink">{p.name}</p>
                <StatusBadge status={p.status} />
              </div>
              {p.description && <p className="text-sm text-muted mb-3">{p.description}</p>}
              {p.client_name && !['client', 'buyer'].includes(user.role) && (
                <p className="text-xs text-muted font-mono mb-1">CLIENT: {p.client_name}</p>
              )}
              <p className="text-xs text-muted font-mono">
                {p.start_date || '—'} → {p.due_date || '—'}
              </p>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
