import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Target, Crosshair, Flame, Zap, Coins, CheckCircle,
  Plus, ArrowRight, Clock, TrendingUp, AlertTriangle
} from 'lucide-react';

/* Decorative corner stickers for empty state */
const DECO = [
  { emoji: '🧠', top: 12, right: 16, size: '1.8rem', anim: 'sticker-float' },
  { emoji: '💜', bottom: 12, left: 16, size: '1.6rem', anim: 'sticker-float-reverse' },
  { emoji: '✨', top: 12, left: 20, size: '1.4rem', anim: 'sticker-float' },
];

export default function Dashboard() {
  const { user, authFetch } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      authFetch('/api/tasks').then(r => r.json()),
      authFetch('/api/focus/stats').then(r => r.json()),
    ]).then(([t, s]) => {
      setTasks(t);
      setStats(s);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const activeTasks = tasks.filter(t => t.status === 'active');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const totalSubtasksCompleted = tasks.reduce((sum, t) => sum + (t.completedCount || 0), 0);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <div className="loading-shimmer" style={{ height: 120, marginBottom: 16 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {[1,2,3,4].map(i => <div key={i} className="loading-shimmer" style={{ height: 100 }} />)}
        </div>
      </div>
    );
  }

  const xpForNextLevel = 200;
  const currentLevelXp = (user?.xp || 0) % xpForNextLevel;
  const xpPercent = (currentLevelXp / xpForNextLevel) * 100;

  const statItems = [
    { icon: <Clock size={20} />, value: stats?.totalMinutes || 0, label: 'Focus Minutes', color: '#C084FC', glow: 'rgba(192,132,252,0.2)' },
    { icon: <CheckCircle size={20} />, value: totalSubtasksCompleted, label: 'Tasks Done', color: '#34D399', glow: 'rgba(52,211,153,0.2)' },
    { icon: <Target size={20} />, value: activeTasks.length, label: 'Active Goals', color: '#F472B6', glow: 'rgba(244,114,182,0.2)' },
    { icon: <TrendingUp size={20} />, value: completedTasks.length, label: 'Goals Complete', color: '#FB7185', glow: 'rgba(251,113,133,0.2)' },
  ];

  return (
    <div>
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title">
          Hey {user?.name?.split(' ')[0]} <span className="float-anim" style={{ display: 'inline-block' }}>👋</span>
        </h1>
        <p className="section-subtitle">Let's make today count. One step at a time. 💜</p>
      </motion.div>

      {/* XP Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="card card-gradient card-shine" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}
      >
        <div style={{ flex: '1 1 200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="holo-text" style={{ fontSize: '1.3rem', fontWeight: 800 }}>Level {user?.level || 1}</span>
            <span className="badge badge-primary"><Zap size={12} /> {user?.xp || 0} XP</span>
          </div>
          <div className="xp-bar" style={{ height: 10, marginBottom: 4 }}>
            <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {currentLevelXp} / {xpForNextLevel} XP to next level
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div className="streak-flame" style={{ fontSize: '1.8rem' }}>🔥</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user?.streak || 0}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>day streak</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem' }}>💎</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user?.coins || 0}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>coins</div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {statItems.map((stat, i) => (
            <motion.div key={i} className="card card-glow card-holo"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              style={{ padding: 16, textAlign: 'center' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: `${stat.color}15`,
                boxShadow: `0 0 20px ${stat.glow}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 8px', color: stat.color,
              }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stat.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}
      >
        <button className="btn btn-primary" onClick={() => navigate('/add-goal')}>
          <Plus size={18} /> New Goal
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/focus')}>
          <Crosshair size={18} /> Focus Mode
        </button>
        <button className="panic-btn" onClick={() => navigate('/panic')}
          style={{ padding: '10px 20px', fontSize: '0.9rem', borderRadius: 9999 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={16} /> Panic Mode
          </span>
        </button>
      </motion.div>

      {/* Active Goals */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12 }}>
          Active Goals ({activeTasks.length})
        </h2>
        {activeTasks.length === 0 ? (
          <div className="card card-glass" style={{ padding: 40, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative stickers for empty state */}
            {DECO.map((d, i) => (
              <span key={i} className={d.anim} style={{
                position: 'absolute', fontSize: d.size, ...d,
                filter: 'drop-shadow(0 3px 6px rgba(192,132,252,0.2))',
              }}>
                {d.emoji}
              </span>
            ))}
            <div className="float-anim" style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎯</div>
            <h3 style={{ fontWeight: 700, marginBottom: 4 }}>No active goals yet</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>
              Add a goal and let AI break it into tiny steps for you.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/add-goal')}>
              <Plus size={18} /> Add Your First Goal
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeTasks.map((task, idx) => {
              const progress = task.totalCount > 0 ? (task.completedCount / task.totalCount) * 100 : 0;
              const nextSubtask = task.subtasks?.find(s => s.status === 'pending');
              return (
                <motion.div key={task.id} className="card card-glow card-shine"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/focus', { state: { taskId: task.id } })}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{task.goal}</h3>
                      {nextSubtask && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                          Next: {nextSubtask.title}
                        </p>
                      )}
                    </div>
                    <span className="badge badge-primary">{task.completedCount}/{task.totalCount}</span>
                  </div>
                  <div className="xp-bar" style={{ height: 6 }}>
                    <div className="xp-bar-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    <span>{Math.round(progress)}% complete</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-primary)' }}>
                      Continue <ArrowRight size={12} />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Completed Goals */}
      {completedTasks.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{ marginTop: 28 }}
        >
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12, color: 'var(--color-success)' }}>
            ✅ Completed ({completedTasks.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {completedTasks.slice(0, 5).map(task => (
              <div key={task.id} className="card" style={{ padding: 14, opacity: 0.7 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={18} color="var(--color-success)" />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{task.goal}</span>
                  <span className="badge badge-success" style={{ marginLeft: 'auto' }}>{task.totalCount} steps</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
