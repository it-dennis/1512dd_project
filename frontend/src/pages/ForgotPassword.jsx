import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.requestPasswordReset(email);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24">
      <h1 className="text-3xl font-bold text-white mb-2">Passwort vergessen</h1>
      <p className="mb-8 font-mono text-sm" style={{ color: 'rgba(170,255,204,0.60)' }}>
        Gib deine E-Mail-Adresse ein — du erhältst einen Reset-Link.
      </p>

      {submitted ? (
        <div className="card">
          <div className="text-phosphor font-mono text-sm bg-crt-dark/60 border border-phosphor-muted rounded p-4">
            <p className="font-bold mb-1">E-Mail gesendet</p>
            <p style={{ color: 'rgba(170,255,204,0.75)' }}>
              Falls diese Adresse registriert ist, erhältst du in Kürze einen Reset-Link.
            </p>
          </div>
          <p className="font-mono text-sm mt-6 text-center" style={{ color: 'rgba(30,167,88,0.70)' }}>
            <Link to="/login" className="text-phosphor hover:underline">
              Zurück zum Login
            </Link>
          </p>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="card space-y-4">
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
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Senden...' : 'Reset-Link anfordern'}
            </button>
          </form>

          <p className="font-mono text-sm mt-6 text-center" style={{ color: 'rgba(30,167,88,0.70)' }}>
            <Link to="/login" className="text-phosphor hover:underline">
              Zurück zum Login
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
