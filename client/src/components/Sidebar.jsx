import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Target, Crosshair, BarChart3,
  Users, AlertTriangle, User, Settings, LogOut, Menu, X,
  Flame, Coins, Zap
} from 'lucide-react';
import dopelyLogo from '../assets/adhd-logo.png';

const NAV_ITEMS = [
  { section: 'Main' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/add-goal', icon: Target, label: 'Add Goal' },
  { to: '/focus', icon: Crosshair, label: 'Focus Mode' },
  { section: 'Explore' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/rooms', icon: Users, label: 'Focus Rooms' },
  { to: '/panic', icon: AlertTriangle, label: 'Panic Mode' },
  { section: 'Account' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const MOBILE_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/add-goal', icon: Target, label: 'Goal' },
  { to: '/focus', icon: Crosshair, label: 'Focus' },
  { to: '/analytics', icon: BarChart3, label: 'Stats' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <>
      <button className="hamburger" onClick={() => setOpen(true)}>
        <Menu size={20} />
      </button>

      <div className={`sidebar-overlay ${open ? 'active' : ''}`} onClick={() => setOpen(false)} />

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <img src={dopelyLogo} alt="Dopely" style={{ width: 64, height: 64, objectFit: 'contain' }} />
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '1.6rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #c026d3, #a855f7, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
            filter: 'drop-shadow(0 2px 4px rgba(192, 132, 252, 0.2))'
          }}>Dopely</h1>
          <button onClick={() => setOpen(false)}
            style={{
              marginLeft: 'auto', display: open ? 'flex' : 'none',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-secondary)', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: 8,
            }}>
            <X size={18} />
          </button>
        </div>

        {/* User Stats Mini */}
        {user && (
          <div className="card card-gradient" style={{ padding: '12px 14px', marginBottom: 16, overflow: 'visible' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: 'white', fontWeight: 700,
                boxShadow: '0 0 12px rgba(192,132,252,0.3)',
              }}>
                {user.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                  Level {user.level || 1}
                </div>
              </div>
            </div>
            <div className="xp-bar" style={{ marginBottom: 6 }}>
              <div className="xp-bar-fill" style={{ width: `${((user.xp || 0) % 200) / 200 * 100}%` }} />
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Zap size={12} color="var(--color-primary)" /> {user.xp || 0} XP
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Coins size={12} color="var(--color-warning)" /> {user.coins || 0}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Flame size={12} color="var(--color-accent)" /> {user.streak || 0}
              </span>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item, i) => {
            if (item.section) {
              return <div key={i} className="nav-section-label">{item.section}</div>;
            }
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setOpen(false)}>
                <Icon size={20} className="nav-icon" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <button className="nav-item" onClick={logout} style={{ marginTop: 8 }}>
          <LogOut size={20} className="nav-icon" /> Log out
        </button>
      </aside>

      <nav className="mobile-nav">
        {MOBILE_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <NavLink key={item.to} to={item.to} className={`mobile-nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={20} /> {item.label}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
