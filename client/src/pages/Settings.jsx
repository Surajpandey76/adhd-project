import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Moon, Sun, Bell, BellOff, Shield, Trash2, LogOut } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => document.body.classList.contains('dark'));
  const [notifications, setNotifications] = useState(true);

  const toggleDarkMode = () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    document.body.classList.toggle('dark', newVal);
    localStorage.setItem('focusflow_dark', newVal ? 'true' : 'false');
  };

  useEffect(() => {
    const saved = localStorage.getItem('focusflow_dark');
    if (saved === 'true') { setDarkMode(true); document.body.classList.add('dark'); }
  }, []);

  const SettingRow = ({ icon, title, subtitle, action }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
      borderBottom: '1px solid rgba(240,212,232,0.4)',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: 'rgba(192,132,252,0.08)',
        boxShadow: '0 0 12px rgba(192,132,252,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-primary)', transition: 'all 0.3s ease',
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{title}</div>
        {subtitle && <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );

  const Toggle = ({ active, onToggle }) => (
    <button onClick={onToggle} style={{
      width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
      background: active ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'var(--color-border)',
      boxShadow: active ? '0 0 15px rgba(192,132,252,0.4)' : 'none',
      transition: 'all 0.3s ease', position: 'relative',
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%', background: 'white', position: 'absolute',
        top: 3, left: active ? 23 : 3, transition: 'left 0.2s',
        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.15), 0 0 8px rgba(192,132,252,0.2)' : '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </button>
  );

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative' }}>
      {/* Decorative sticker */}
      <span className="sticker-float" style={{ position: 'absolute', top: -5, right: 0, fontSize: '1.8rem', pointerEvents: 'none', filter: 'drop-shadow(0 4px 8px rgba(192,132,252,0.2))' }}>⚙️</span>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title">Settings ⚙️</h1>
        <p className="section-subtitle">Customize your Dopely experience. 💜</p>

        <div className="card card-glass" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Appearance</h3>
          <SettingRow
            icon={darkMode ? <Moon size={20} /> : <Sun size={20} />}
            title="Dark Mode"
            subtitle="Easier on the eyes at night"
            action={<Toggle active={darkMode} onToggle={toggleDarkMode} />}
          />
        </div>

        <div className="card card-glass" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notifications</h3>
          <SettingRow
            icon={notifications ? <Bell size={20} /> : <BellOff size={20} />}
            title="Push Notifications"
            subtitle="Gentle reminders to stay on track"
            action={<Toggle active={notifications} onToggle={() => setNotifications(!notifications)} />}
          />
        </div>

        <div className="card card-glass" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account</h3>
          <SettingRow icon={<Shield size={20} />} title="Account Info" subtitle={user?.email} action={null} />
          <SettingRow icon={<LogOut size={20} />} title="Log Out" subtitle="Sign out of your account"
            action={<button className="btn btn-ghost btn-sm" onClick={logout} style={{ color: 'var(--color-danger)' }}>Log out</button>} />
        </div>

        <div className="card card-glass" style={{ marginBottom: 20, borderColor: 'rgba(251,113,133,0.3)' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-danger)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Danger Zone</h3>
          <SettingRow icon={<Trash2 size={20} />} title="Delete Account" subtitle="This action cannot be undone"
            action={<button className="btn btn-danger btn-sm">Delete</button>} />
        </div>

        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
          Dopely v1.0 — Made with 💜 for ADHD brains
        </div>
      </motion.div>
    </div>
  );
}
