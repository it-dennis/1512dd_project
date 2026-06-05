import { Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Articles from './pages/Articles';
import TechnischeDaten from './pages/TechnischeDaten';
import ArticleDetail from './pages/ArticleDetail';
import Emulator from './pages/Emulator';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Admin from './pages/Admin';
import Praesentation from './pages/Praesentation';
import Impressum from './pages/Impressum';
import Datenschutz from './pages/Datenschutz';

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/technik" element={<TechnischeDaten />} />
            <Route path="/articles/:slug" element={<ArticleDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/emulator"
              element={
                <ProtectedRoute>
                  <Emulator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              }
            />
            <Route path="/praesentation" element={<Praesentation />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/datenschutz" element={<Datenschutz />} />
          </Routes>
        </main>
        <footer className="border-t border-phosphor-muted/20 py-6 text-center font-mono text-xs" style={{ color: 'rgba(30,167,88,0.50)' }}>
          Schneider/Amstrad PC1512-DD Emulator Plattform · Weiterbildungsprojekt von Dennis Rapp · 2026
          {' · '}
          <Link to="/impressum" className="hover:opacity-80 transition-opacity">Impressum</Link>
          {' · '}
          <Link to="/datenschutz" className="hover:opacity-80 transition-opacity">Datenschutz</Link>
          {' '}
          <Link to="/admin" style={{ color: 'rgba(30,167,88,0.08)' }} className="hover:opacity-30 transition-opacity">·</Link>
        </footer>
      </div>
    </AuthProvider>
  );
}
