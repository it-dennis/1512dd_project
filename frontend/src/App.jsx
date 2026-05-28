import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Emulator from './pages/Emulator';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:slug" element={<ArticleDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route
              path="/emulator"
              element={
                <ProtectedRoute>
                  <Emulator />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <footer className="border-t border-phosphor-muted/20 py-6 text-center font-mono text-xs" style={{ color: 'rgba(30,167,88,0.50)' }}>
          Schneider/Amstrad PC1512-DD Emulator Plattform · Weiterbildungsprojekt von Dennis Rapp · 2026
        </footer>
      </div>
    </AuthProvider>
  );
}
