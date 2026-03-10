import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Zap, Coins, Flame, Trophy, Crown } from 'lucide-react';

const ACHIEVEMENTS = [
  { id: 1, icon: '🎯', title: 'First Goal', desc: 'Created your first goal', threshold: 1, type: 'goals' },
  { id: 2, icon: '⚡', title: 'Quick Start', desc: 'Used Focus Mode', threshold: 1, type: 'sessions' },
  { id: 3, icon: '🔥', title: 'On Fire', desc: '3-day streak', threshold: 3, type: 'streak' },
  { id: 4, icon: '💎', title: 'Gem Collector', desc: 'Earned 100 coins', threshold: 100, type: 'coins' },
  { id: 5, icon: '🏆', title: 'Centurion', desc: 'Earned 500 XP', threshold: 500, type: 'xp' },
  { id: 6, icon: '👑', title: 'Level 5', desc: 'Reached Level 5', threshold: 5, type: 'level' },
  { id: 7, icon: '⭐', title: 'Star Player', desc: '10 tasks completed', threshold: 10, type: 'tasks' },
  { id: 8, icon: '🌟', title: 'Super Star', desc: '1000 XP earned', threshold: 1000, type: 'xp' },
];

export default function Profile() {
  const { user, authFetch } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      authFetch('/api/tasks').then(r => r.json()),
      authFetch('/api/focus/stats').then(r => r.json()),
    ]).then(([t, s]) => { setTasks(t); setStats(s); });
  }, []);

  const totalSubtasksCompleted = tasks.reduce((sum, t) => sum + (t.completedCount || 0), 0);
  const completedGoals = tasks.filter(t => t.status === 'completed').length;

  const checkAchievement = (a) => {
    switch (a.type) {
      case 'goals': return completedGoals >= a.threshold;
      case 'sessions': return (stats?.totalSessions || 0) >= a.threshold;
      case 'streak': return (user?.streak || 0) >= a.threshold;
      case 'coins': return (user?.coins || 0) >= a.threshold;
      case 'xp': return (user?.xp || 0) >= a.threshold;
      case 'level': return (user?.level || 1) >= a.threshold;
      case 'tasks': return totalSubtasksCompleted >= a.threshold;
      default: return false;
    }
  };

  const xpForNextLevel = 200;
  const currentLevelXp = (user?.xp || 0) % xpForNextLevel;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative' }}>
      {/* Decorative stickers */}
      <span className="sticker-float" style={{ position: 'absolute', top: -5, right: -5, fontSize: '2rem', pointerEvents: 'none', filter: 'drop-shadow(0 4px 8px rgba(192,132,252,0.2))' }}>✨</span>
      <span className="sticker-float-reverse" style={{ position: 'absolute', top: 120, left: -12, fontSize: '1.6rem', pointerEvents: 'none', filter: 'drop-shadow(0 4px 8px rgba(244,114,182,0.2))' }}>🧠</span>
      <span className="sticker-float" style={{ position: 'absolute', bottom: 50, right: -8, fontSize: '1.4rem', pointerEvents: 'none', filter: 'drop-shadow(0 4px 8px rgba(251,113,133,0.2))' }}>💜</span>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {/* Profile Header */}
        <div className="card card-gradient card-shine" style={{ textAlign: 'center', padding: 32, marginBottom: 20 }}>
          <motion.div
            animate={{ scale: [1, 1.03, 1], rotateZ: [0, 2, -2, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            style={{
              width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', color: 'white', fontWeight: 800,
              boxShadow: '0 0 30px rgba(192,132,252,0.4), 0 0 60px rgba(244,114,182,0.2)',
              transform: 'perspective(500px) rotateX(5deg)',
            }}>
            {user?.name?.[0]?.toUpperCase() || '?'}
          </motion.div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 2 }}>{user?.name}</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>{user?.email}</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
            {[
              { icon: <Crown size={16} />, value: user?.level || 1, label: 'Level', color: 'var(--color-primary)' },
              { icon: <Zap size={16} />, value: user?.xp || 0, label: 'XP', color: 'var(--color-warning)' },
              { icon: <Coins size={16} />, value: user?.coins || 0, label: 'Coins', color: 'var(--color-secondary)' },
              { icon: <Flame size={16} />, value: user?.streak || 0, label: 'Streak', color: 'var(--color-accent)', flame: true },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div className={stat.flame ? 'streak-flame' : ''} style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', color: stat.color }}>
                  {stat.icon}
                  <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>{stat.value}</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={{ maxWidth: 300, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
              <span>Level {user?.level || 1}</span>
              <span>{currentLevelXp}/{xpForNextLevel} XP</span>
            </div>
            <div className="xp-bar" style={{ height: 10 }}>
              <div className="xp-bar-fill" style={{ width: `${(currentLevelXp / xpForNextLevel) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Achievements */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 14 }}>
          <Trophy size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Achievements
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
          {ACHIEVEMENTS.map((a, i) => {
            const unlocked = checkAchievement(a);
            return (
              <motion.div key={a.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`card card-glass ${unlocked ? 'glow-success' : ''}`}
                style={{
                  padding: 16, textAlign: 'center',
                  opacity: unlocked ? 1 : 0.4,
                  filter: unlocked ? 'none' : 'grayscale(1)',
                  transition: 'all 0.4s ease',
                }}>
                <div className={unlocked ? 'float-anim' : ''} style={{ fontSize: '1.8rem', marginBottom: 6 }}>{a.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 2 }}>{a.title}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{a.desc}</div>
                {unlocked && (
                  <div className="badge badge-success" style={{ marginTop: 6, fontSize: '0.65rem' }}>Unlocked!</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
