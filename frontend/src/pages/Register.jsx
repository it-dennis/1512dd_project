import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/client';

export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.register(email, username, password);
      setRegistered(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registrierung fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="max-w-md mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold text-white mb-2">Fast geschafft!</h1>
        <p className="text-gray-400 mb-8 font-mono text-sm">
          Konto erfolgreich erstellt.
        </p>
        <div className="card space-y-4">
          <div className="text-amber-400 font-mono text-sm bg-amber-950/30 border border-amber-800 rounded p-4">
            <p className="font-bold mb-2">Bestätigungs-E-Mail gesendet</p>
            <p className="text-amber-300/80">
              Wir haben eine E-Mail an <span className="text-amber-400 font-bold">{email}</span> geschickt.
              Klicke auf den Link in der E-Mail, um dein Konto zu aktivieren.
            </p>
          </div>
          <p className="text-gray-500 font-mono text-xs">
            Keine E-Mail erhalten? Überprüfe deinen Spam-Ordner.
          </p>
        </div>
        <p className="text-gray-500 font-mono text-sm mt-6 text-center">
          Schon bestätigt?{' '}
          <Link to="/login" className="text-amber-500 hover:underline">
            Jetzt einloggen
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-24">
      <h1 className="text-3xl font-bold text-white mb-2">Registrieren</h1>
      <p className="text-gray-400 mb-8 font-mono text-sm">
        Konto erstellen um den Emulator zu nutzen.
      </p>

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

      <p className="text-gray-500 font-mono text-sm mt-6 text-center">
        Schon ein Konto?{' '}
        <Link to="/login" className="text-amber-500 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
