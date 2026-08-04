import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not sign in. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display font-bold text-white text-2xl tracking-tight">NEXUS</p>
          <p className="text-white/40 text-xs font-mono mt-1 uppercase tracking-widest">Software House OS</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface rounded-lg p-6 shadow-xl">
          <h2 className="font-display font-semibold text-lg text-ink mb-4">Sign in</h2>

          {error && (
            <div className="mb-4 px-3 py-2 rounded bg-warn/10 text-warn text-sm">{error}</div>
          )}

          <label className="block text-xs font-medium text-muted mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-3 py-2 rounded-md border border-line focus:border-accent outline-none text-sm"
            placeholder="you@softwarehouse.com"
          />

          <label className="block text-xs font-medium text-muted mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-6 px-3 py-2 rounded-md border border-line focus:border-accent outline-none text-sm"
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-navy text-white py-2.5 rounded-md text-sm font-medium hover:bg-navy-hover transition-colors disabled:opacity-50"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-white/30 text-xs text-center mt-5 font-mono leading-relaxed">
          Demo accounts (after running the seed script) all use password: Password123!<br />
          e.g. admin@softwarehouse.com
        </p>
      </div>
    </div>
  );
}
