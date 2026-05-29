import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="border-b border-phosphor-muted/20 bg-crt-black sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="hover:opacity-80 transition-opacity flex items-center gap-3">
          <img src="/logo/icon-192.png" alt="1512dd Logo" className="h-10 w-10" />
          <span className="font-display text-phosphor text-lg hidden sm:inline tracking-wider">1512dd</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/articles"
            className="text-phosphor-soft/70 hover:text-phosphor transition-colors font-mono text-sm"
          >
            Infothek
          </Link>

          <Link
            to="/technik"
            className="text-phosphor-soft/70 hover:text-phosphor transition-colors font-mono text-sm"
          >
            Technik
          </Link>

          {user ? (
            <>
              <Link
                to="/emulator"
                className="text-phosphor-soft/70 hover:text-phosphor transition-colors font-mono text-sm"
              >
                Emulator
              </Link>
              <span className="text-phosphor-muted/60 font-mono text-xs hidden sm:inline">
                [{user.username}]
              </span>
              <button onClick={handleLogout} className="btn-secondary text-xs py-1.5">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-phosphor-soft/70 hover:text-phosphor transition-colors font-mono text-sm">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm py-1.5">
                Registrieren
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
