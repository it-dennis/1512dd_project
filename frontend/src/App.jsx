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
        <footer className="border-t border-gray-800 py-6 text-center text-gray-600 font-mono text-xs">
          Amstrad PC1512-DD Emulator Platform · Weiterbildungsprojekt
        </footer>
      </div>
    </AuthProvider>
  );
}
