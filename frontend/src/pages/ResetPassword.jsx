import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/client';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold text-white mb-2">Passwort zurücksetzen</h1>
        <div className="card mt-8">
          <div className="text-red-400 text-sm font-mono bg-red-950/30 border border-red-800 rounded p-4">
            <p className="font-bold mb-1">Ungültiger Link</p>
            <p>Kein Reset-Token gefunden. Bitte fordere einen neuen Link an.</p>
          </div>
        </div>
        <p className="font-mono text-sm mt-6 text-center" style={{ color: 'rgba(30,167,88,0.70)' }}>
          <Link to="/forgot-password" className="text-phosphor hover:underline">
            Neuen Reset-Link anfordern
          </Link>
        </p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setStatus('error');
      setMessage('Die Passwörter stimmen nicht überein.');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.resetPassword(token, password);
      setStatus('success');
      setMessage(res.data.message);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.detail || 'Reset fehlgeschlagen. Bitte fordere einen neuen Link an.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24">
      <h1 className="text-3xl font-bold text-white mb-2">Passwort zurücksetzen</h1>
      <p className="mb-8 font-mono text-sm" style={{ color: 'rgba(170,255,204,0.60)' }}>
        Gib dein neues Passwort ein.
      </p>

      {status === 'success' ? (
        <>
          <div className="card">
            <div className="text-phosphor font-mono text-sm bg-crt-dark/60 border border-phosphor-muted rounded p-4">
              <p className="font-bold mb-1">Erfolgreich!</p>
              <p style={{ color: 'rgba(170,255,204,0.75)' }}>{message}</p>
            </div>
          </div>
          <p className="font-mono text-sm mt-6 text-center" style={{ color: 'rgba(30,167,88,0.70)' }}>
            <Link to="/login" className="text-phosphor hover:underline">
              Jetzt einloggen
            </Link>
          </p>
        </>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="card space-y-4">
            {status === 'error' && (
              <div className="text-red-400 text-sm font-mono bg-red-950/30 border border-red-800 rounded p-3">
                {message}
              </div>
            )}
            <div>
              <label className="font-mono text-sm block mb-2" style={{ color: 'rgba(170,255,204,0.60)' }}>Neues Passwort</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="input-field"
              />
            </div>
            <div>
              <label className="font-mono text-sm block mb-2" style={{ color: 'rgba(170,255,204,0.60)' }}>Passwort wiederholen</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                className="input-field"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Speichern...' : 'Passwort speichern'}
            </button>
          </form>

          <p className="font-mono text-sm mt-6 text-center" style={{ color: 'rgba(30,167,88,0.70)' }}>
            <Link to="/forgot-password" className="text-phosphor hover:underline">
              Neuen Reset-Link anfordern
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
