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
    <nav className="border-b border-gray-800 bg-gray-950 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="font-mono text-amber-400 font-bold text-lg tracking-wider hover:text-amber-300 transition-colors">
          PC1512<span className="text-gray-600">-DD</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/articles"
            className="text-gray-400 hover:text-amber-400 transition-colors font-mono text-sm"
          >
            Infothek
          </Link>

          {user ? (
            <>
              <Link
                to="/emulator"
                className="text-gray-400 hover:text-amber-400 transition-colors font-mono text-sm"
              >
                Emulator
              </Link>
              <span className="text-gray-600 font-mono text-xs hidden sm:inline">
                [{user.username}]
              </span>
              <button onClick={handleLogout} className="btn-secondary text-xs py-1.5">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-400 hover:text-amber-400 transition-colors font-mono text-sm">
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
