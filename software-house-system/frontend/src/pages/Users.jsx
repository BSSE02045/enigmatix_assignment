import { useEffect, useState } from 'react';
import client from '../api/client';
import Layout from '../components/Layout';
import { ROLE_LABELS } from '../components/Sidebar';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = () => {
    setLoading(true);
    client.get('/users').then((res) => setUsers(res.data)).finally(() => setLoading(false));
  };

  useEffect(loadUsers, []);

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this account?')) return;
    await client.delete(`/users/${id}`);
    loadUsers();
  };

  return (
    <Layout title="Users" subtitle="Everyone with access to Nexus.">
      {loading ? (
        <p className="text-muted text-sm font-mono">LOADING…</p>
      ) : (
        <div className="bg-surface border border-line rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-mono uppercase text-muted">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-5 py-3 font-medium text-ink">{u.name}</td>
                  <td className="px-5 py-3 text-muted">{u.email}</td>
                  <td className="px-5 py-3 text-muted font-mono text-xs uppercase">{ROLE_LABELS[u.role] || u.role}</td>
                  <td className="px-5 py-3">
                    <span className={`status-chip ${u.is_active ? 'bg-good/10 text-good' : 'bg-warn/10 text-warn'}`}>
                      {u.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {u.is_active && (
                      <button onClick={() => handleDeactivate(u.id)} className="text-xs text-warn font-medium">
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
