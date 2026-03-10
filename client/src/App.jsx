import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import Sidebar from './components/Sidebar';
import MouseLight from './components/MouseLight';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import AddGoal from './pages/AddGoal';
import FocusMode from './pages/FocusMode';
import Analytics from './pages/Analytics';
import FocusRooms from './pages/FocusRooms';
import PanicMode from './pages/PanicMode';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="breathe-anim" style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
            boxShadow: '0 8px 30px rgba(192,132,252,0.4)',
          }}>⚡</div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  return (
    <GameProvider>
      <MouseLight />
      <div className="app-layout">
        <Sidebar />
        <main className="app-main scribble-bg">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-goal" element={<AddGoal />} />
            <Route path="/focus" element={<FocusMode />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/rooms" element={<FocusRooms />} />
            <Route path="/panic" element={<PanicMode />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </GameProvider>
  );
}

function AppRoot() {
  const { user, loading } = useAuth();

  if (loading) return null;

  // If user is logged in, show the protected layout
  // Otherwise, show onboarding at root
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Onboarding />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoot />
      </AuthProvider>
    </BrowserRouter>
  );
}
