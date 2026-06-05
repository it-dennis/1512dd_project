import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/emulator';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      await login(res.data.access_token);
      navigate(from, { replace: true });
    } catch {
      setError('E-Mail oder Passwort falsch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24">
      <h1 className="text-3xl font-bold text-white mb-2">Login</h1>
      <p className="mb-8 font-mono text-sm" style={{ color: 'rgba(170,255,204,0.60)' }}>
        Einloggen um den Emulator zu starten.
      </p>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && (
          <div className="text-red-400 text-sm font-mono bg-red-950/30 border border-red-800 rounded p-3">
            {error}
          </div>
        )}
        <div>
          <label className="font-mono text-sm block mb-2" style={{ color: 'rgba(170,255,204,0.60)' }}>E-Mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="input-field"
          />
        </div>
        <div>
          <label className="font-mono text-sm block mb-2" style={{ color: 'rgba(170,255,204,0.60)' }}>Passwort</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="input-field"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Einloggen...' : 'Einloggen'}
        </button>
        <div className="text-right">
          <Link to="/forgot-password" className="font-mono text-xs hover:underline" style={{ color: 'rgba(170,255,204,0.50)' }}>
            Passwort vergessen?
          </Link>
        </div>
      </form>

      <p className="font-mono text-sm mt-6 text-center" style={{ color: 'rgba(30,167,88,0.70)' }}>
        Noch kein Konto?{' '}
        <Link to="/register" className="text-phosphor hover:underline">
          Registrieren
        </Link>
      </p>
    </div>
  );
}
