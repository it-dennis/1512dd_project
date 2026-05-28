import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/client';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Kein Bestätigungstoken gefunden.');
      return;
    }
    authApi.verifyEmail(token)
      .then(res => {
        setStatus('success');
        setMessage(res.data.message);
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.detail || 'Bestätigung fehlgeschlagen.');
      });
  }, [searchParams]);

  return (
    <div className="max-w-md mx-auto px-4 py-24">
      <h1 className="text-3xl font-bold text-white mb-2">E-Mail bestätigen</h1>

      {status === 'loading' && (
        <p className="font-mono text-sm mt-8" style={{ color: 'rgba(170,255,204,0.60)' }}>Bestätigung wird verarbeitet...</p>
      )}

      {status === 'success' && (
        <>
          <div className="card mt-8">
            <div className="text-phosphor font-mono text-sm bg-crt-dark/60 border border-phosphor-muted rounded p-4">
              <p className="font-bold mb-1">Erfolgreich bestätigt!</p>
              <p style={{ color: 'rgba(170,255,204,0.75)' }}>{message}</p>
            </div>
          </div>
          <p className="font-mono text-sm mt-6 text-center" style={{ color: 'rgba(30,167,88,0.70)' }}>
            <Link to="/login" className="text-phosphor hover:underline">
              Jetzt einloggen
            </Link>
          </p>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="card mt-8">
            <div className="text-red-400 text-sm font-mono bg-red-950/30 border border-red-800 rounded p-4">
              <p className="font-bold mb-1">Fehler</p>
              <p>{message}</p>
            </div>
          </div>
          <p className="font-mono text-sm mt-6 text-center" style={{ color: 'rgba(30,167,88,0.70)' }}>
            <Link to="/register" className="text-phosphor hover:underline">
              Erneut registrieren
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
