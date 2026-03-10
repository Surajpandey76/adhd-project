import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';
import { Clock, Flame, CheckCircle, TrendingUp, Zap, Target } from 'lucide-react';

export default function Analytics() {
  const { user, authFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authFetch('/api/focus/stats').then(r => r.json()),
      authFetch('/api/tasks').then(r => r.json()),
    ]).then(([s, t]) => { setStats(s); setTasks(t); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div>
        <div className="loading-shimmer" style={{ height: 200, marginBottom: 16 }} />
        <div className="loading-shimmer" style={{ height: 300 }} />
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalSubtasks = tasks.reduce((s, t) => s + (t.completedCount || 0), 0);

  const summaryCards = [
    { icon: <Clock size={22} />, label: 'Total Focus', value: `${stats?.totalMinutes || 0} min`, color: '#C084FC', glow: 'rgba(192,132,252,0.2)' },
    { icon: <Zap size={22} />, label: 'Total XP', value: user?.xp || 0, color: '#FBBF24', glow: 'rgba(251,191,36,0.2)' },
    { icon: <Flame size={22} />, label: 'Current Streak', value: `${user?.streak || 0} days`, color: '#FB7185', glow: 'rgba(251,113,133,0.2)' },
    { icon: <CheckCircle size={22} />, label: 'Tasks Done', value: totalSubtasks, color: '#34D399', glow: 'rgba(52,211,153,0.2)' },
    { icon: <Target size={22} />, label: 'Goals Set', value: tasks.length, color: '#F472B6', glow: 'rgba(244,114,182,0.2)' },
    { icon: <TrendingUp size={22} />, label: 'Goals Done', value: completedTasks, color: '#D8B4FE', glow: 'rgba(216,180,254,0.2)' },
  ];

  return (
    <div style={{ position: 'relative' }}>
      {/* Decorative stickers */}
      <span className="sticker-float" style={{ position: 'absolute', top: -5, right: 0, fontSize: '2rem', pointerEvents: 'none', filter: 'drop-shadow(0 4px 8px rgba(192,132,252,0.2))' }}>📊</span>
      <span className="sticker-float-reverse" style={{ position: 'absolute', top: 200, left: -10, fontSize: '1.6rem', pointerEvents: 'none', filter: 'drop-shadow(0 4px 8px rgba(244,114,182,0.2))' }}>📈</span>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title">Progress Analytics 📊</h1>
        <p className="section-subtitle">See how far you've come. Every step counts. 💜</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {summaryCards.map((card, i) => (
            <motion.div key={i} className="card card-glow card-holo"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04 }}
              style={{ padding: 18, textAlign: 'center' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: `${card.color}15`, boxShadow: `0 0 20px ${card.glow}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 8px', color: card.color, transition: 'all 0.3s ease',
              }}>
                {card.icon}
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{card.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{card.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="card card-glass" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>Weekly Focus Time</h3>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={stats?.dailyStats || []}>
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} unit=" min" />
                <Tooltip contentStyle={{
                  background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(240,212,232,0.6)', borderRadius: 12, fontSize: '0.85rem',
                  boxShadow: '0 4px 20px rgba(192,132,252,0.1)',
                }} />
                <Bar dataKey="minutes" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C084FC" />
                    <stop offset="100%" stopColor="#F472B6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="card card-glass">
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>Daily Sessions</h3>
          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer>
              <AreaChart data={stats?.dailyStats || []}>
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{
                  background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(240,212,232,0.6)', borderRadius: 12, fontSize: '0.85rem',
                  boxShadow: '0 4px 20px rgba(244,114,182,0.1)',
                }} />
                <Area type="monotone" dataKey="sessions" stroke="#F472B6" fill="url(#areaGrad)" strokeWidth={2} />
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F472B6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#F472B6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
