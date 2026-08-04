import { useEffect, useState } from 'react';
import client from '../api/client';
import Layout from '../components/Layout';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    client.get('/teams').then((res) => setTeams(res.data)).finally(() => setLoading(false));
  }, []);

  const toggleTeam = async (teamId) => {
    if (expanded === teamId) {
      setExpanded(null);
      return;
    }
    setExpanded(teamId);
    const res = await client.get(`/teams/${teamId}/members`);
    setMembers(res.data);
  };

  return (
    <Layout title="Teams" subtitle="Designation-wise teams and their leads.">
      {loading ? (
        <p className="text-muted text-sm font-mono">LOADING…</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {teams.map((t) => (
            <div key={t.id} className="bg-surface border border-line rounded-lg p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display font-semibold text-ink">{t.name}</p>
                  <p className="text-xs text-muted mt-0.5">{t.description}</p>
                </div>
                <span className="status-chip bg-line text-muted">{t.member_count} MEMBERS</span>
              </div>
              <p className="text-sm text-ink mt-3">
                Lead: <span className="font-medium">{t.lead_name || 'Unassigned'}</span>
              </p>
              <button
                onClick={() => toggleTeam(t.id)}
                className="text-xs text-accent font-medium mt-3"
              >
                {expanded === t.id ? 'Hide members' : 'View members →'}
              </button>

              {expanded === t.id && (
                <ul className="mt-3 border-t border-line pt-3 space-y-2">
                  {members.map((m) => (
                    <li key={m.id} className="text-sm text-ink flex items-center justify-between">
                      <span>{m.name}</span>
                      <span className="text-xs text-muted font-mono">{m.designation || m.role}</span>
                    </li>
                  ))}
                  {members.length === 0 && <li className="text-xs text-muted">No members yet.</li>}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
