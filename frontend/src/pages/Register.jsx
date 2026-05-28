import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/client';

export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await authApi.register(email, username, password);
      setSuccess(res.data.message);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registrierung fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24">
      <h1 className="text-3xl font-bold text-white mb-2">Registrieren</h1>
      <p className="mb-8 font-mono text-sm" style={{ color: 'rgba(170,255,204,0.60)' }}>
        Konto erstellen um den Emulator zu nutzen.
      </p>

      {success ? (
        <div className="card">
          <div className="text-phosphor font-mono text-sm bg-crt-dark/60 border border-phosphor-muted rounded p-4">
            <p className="font-bold mb-1">Konto erstellt!</p>
            <p style={{ color: 'rgba(170,255,204,0.75)' }}>{success}</p>
          </div>
          <p className="font-mono text-sm mt-6 text-center" style={{ color: 'rgba(30,167,88,0.70)' }}>
            <Link to="/login" className="text-phosphor hover:underline">
              Zum Login
            </Link>
          </p>
        </div>
      ) : (
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
            <label className="font-mono text-sm block mb-2" style={{ color: 'rgba(170,255,204,0.60)' }}>Benutzername</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={30}
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
              minLength={8}
              autoComplete="new-password"
              className="input-field"
            />
            <p className="font-mono text-xs mt-1" style={{ color: 'rgba(30,167,88,0.50)' }}>Mindestens 8 Zeichen</p>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Konto wird erstellt...' : 'Konto erstellen'}
          </button>
        </form>
      )}

      {!success && (
        <p className="font-mono text-sm mt-6 text-center" style={{ color: 'rgba(30,167,88,0.70)' }}>
          Schon ein Konto?{' '}
          <Link to="/login" className="text-phosphor hover:underline">
            Login
          </Link>
        </p>
      )}
    </div>
  );
}
