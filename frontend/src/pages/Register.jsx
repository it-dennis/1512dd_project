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
      <p className="text-gray-400 mb-8 font-mono text-sm">
        Konto erstellen um den Emulator zu nutzen.
      </p>

      {success ? (
        <div className="card">
          <div className="text-green-400 font-mono text-sm bg-green-950/30 border border-green-800 rounded p-4">
            <p className="font-bold mb-1">Konto erstellt!</p>
            <p className="text-green-300/80">{success}</p>
          </div>
          <p className="text-gray-500 font-mono text-sm mt-6 text-center">
            <Link to="/login" className="text-green-400 hover:underline">
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
            <label className="text-gray-400 text-sm font-mono block mb-2">E-Mail</label>
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
            <label className="text-gray-400 text-sm font-mono block mb-2">Benutzername</label>
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
            <label className="text-gray-400 text-sm font-mono block mb-2">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="input-field"
            />
            <p className="text-gray-600 text-xs font-mono mt-1">Mindestens 8 Zeichen</p>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Konto wird erstellt...' : 'Konto erstellen'}
          </button>
        </form>
      )}

      {!success && (
        <p className="text-gray-500 font-mono text-sm mt-6 text-center">
          Schon ein Konto?{' '}
          <Link to="/login" className="text-green-400 hover:underline">
            Login
          </Link>
        </p>
      )}
    </div>
  );
}
