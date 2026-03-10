import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Loader, GripVertical, Check, Edit2 } from 'lucide-react';

const SUGGESTIONS = [
  'Prepare for interview',
  'Clean my room',
  'Finish assignment',
  'Build portfolio',
  'Study for exam',
  'Organize my emails',
  'Start exercising',
];

export default function AddGoal() {
  const [goal, setGoal] = useState('');
  const [step, setStep] = useState('input');
  const [subtasks, setSubtasks] = useState([]);
  const [editIdx, setEditIdx] = useState(-1);
  const [editText, setEditText] = useState('');
  const { authFetch } = useAuth();
  const navigate = useNavigate();

  const handleBreakdown = async () => {
    if (!goal.trim()) return;
    setStep('loading');
    try {
      const res = await authFetch('/api/ai/breakdown', {
        method: 'POST',
        body: JSON.stringify({ goal }),
      });
      const data = await res.json();
      setSubtasks(data.subtasks);
      setStep('breakdown');
    } catch {
      setStep('input');
    }
  };

  const handleSave = async () => {
    const taskRes = await authFetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ goal }),
    });
    const task = await taskRes.json();
    await authFetch(`/api/tasks/${task.id}/subtasks`, {
      method: 'POST',
      body: JSON.stringify({ subtasks: subtasks.map(s => s.title) }),
    });
    navigate('/focus', { state: { taskId: task.id } });
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative' }}>
      {/* Decorative corner stickers */}
      <span className="sticker-float" style={{ position: 'absolute', top: -8, right: -8, fontSize: '2rem', filter: 'drop-shadow(0 4px 8px rgba(192,132,252,0.2))', pointerEvents: 'none' }}>💡</span>
      <span className="sticker-float-reverse" style={{ position: 'absolute', bottom: 20, left: -12, fontSize: '1.6rem', filter: 'drop-shadow(0 4px 8px rgba(244,114,182,0.2))', pointerEvents: 'none' }}>🧠</span>

      <AnimatePresence mode="wait">
        {step === 'input' && (
          <motion.div key="input" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <motion.div
                animate={{ scale: [1, 1.08, 1], rotateZ: [0, 3, -3, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                style={{
                  width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 12px 40px rgba(192,132,252,0.4), 0 0 50px rgba(244,114,182,0.15)',
                  transform: 'perspective(500px) rotateX(5deg)',
                }}>
                <Sparkles size={28} color="white" />
              </motion.div>
              <h1 className="section-title">What's your goal? ✨</h1>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>
                Type a goal and AI will break it into tiny steps for you.
              </p>
            </div>

            <div className="card card-glass" style={{ padding: 24 }}>
              <textarea
                className="input"
                placeholder="e.g. Prepare for my software engineering interview..."
                value={goal}
                onChange={e => setGoal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleBreakdown(); } }}
                rows={3}
                style={{ resize: 'none', fontSize: '1.05rem', marginBottom: 16 }}
              />
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }}
                onClick={handleBreakdown} disabled={!goal.trim()}>
                <Sparkles size={18} /> Break it down with AI <ArrowRight size={18} />
              </button>
            </div>

            <div style={{ marginTop: 24 }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 10, fontWeight: 600 }}>
                QUICK SUGGESTIONS
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SUGGESTIONS.map(s => (
                  <motion.button key={s}
                    className="btn btn-secondary btn-sm"
                    onClick={() => setGoal(s)}
                    style={{ fontSize: '0.82rem' }}
                    whileHover={{ scale: 1.05, boxShadow: '0 4px 15px rgba(192,132,252,0.15)' }}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: '80px 0' }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              style={{ display: 'inline-block', marginBottom: 20 }}
            >
              <Loader size={40} color="var(--color-primary)" style={{ filter: 'drop-shadow(0 0 10px rgba(192,132,252,0.5))' }} />
            </motion.div>
            <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Breaking down your goal...</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              AI is creating tiny, manageable steps for you 🧠
            </p>
          </motion.div>
        )}

        {step === 'breakdown' && (
          <motion.div key="breakdown" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <div style={{ marginBottom: 24 }}>
              <span className="badge badge-primary" style={{ marginBottom: 8, display: 'inline-flex' }}>
                <Sparkles size={12} /> AI Generated
              </span>
              <h1 className="section-title">{goal}</h1>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>
                {subtasks.length} micro-steps created. Edit if needed, then start focusing. 🚀
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {subtasks.map((task, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card card-glow"
                  style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <GripVertical size={16} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '0.75rem', fontWeight: 700,
                    boxShadow: '0 0 12px rgba(192,132,252,0.3)',
                  }}>
                    {i + 1}
                  </div>
                  {editIdx === i ? (
                    <input className="input" value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onBlur={() => { const u = [...subtasks]; u[i] = { ...u[i], title: editText }; setSubtasks(u); setEditIdx(-1); }}
                      onKeyDown={e => { if (e.key === 'Enter') { const u = [...subtasks]; u[i] = { ...u[i], title: editText }; setSubtasks(u); setEditIdx(-1); } }}
                      autoFocus style={{ padding: '6px 10px', fontSize: '0.88rem' }} />
                  ) : (
                    <span style={{ flex: 1, fontSize: '0.9rem' }}>{task.title}</span>
                  )}
                  <button className="btn btn-ghost btn-sm"
                    onClick={() => { setEditIdx(i); setEditText(task.title); }}
                    style={{ flexShrink: 0, padding: 4 }}>
                    <Edit2 size={14} />
                  </button>
                </motion.div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" onClick={() => setStep('input')}>
                ← Edit Goal
              </button>
              <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleSave}>
                <Check size={18} /> Save & Start Focusing <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
