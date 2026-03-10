import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';

const CATEGORIES = [
  { id: 'too-many-tasks', label: 'Too many tasks', emoji: '📋' },
  { id: 'messy-room', label: 'Messy room', emoji: '🏠' },
  { id: 'deadline-stress', label: 'Deadline stress', emoji: '⏰' },
  { id: 'studying', label: 'Studying overwhelm', emoji: '📚' },
  { id: 'general', label: 'Something else', emoji: '😰' },
];

export default function PanicMode() {
  const [step, setStep] = useState('ask');
  const [plan, setPlan] = useState(null);
  const [doneSteps, setDoneSteps] = useState([]);
  const { authFetch } = useAuth();

  const handleSelect = async (categoryId) => {
    setStep('loading');
    try {
      const res = await authFetch('/api/panic', {
        method: 'POST',
        body: JSON.stringify({ category: categoryId }),
      });
      const data = await res.json();
      setPlan(data);
      setDoneSteps([]);
      setStep('plan');
    } catch {
      setStep('ask');
    }
  };

  const reset = () => { setStep('ask'); setPlan(null); setDoneSteps([]); };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', position: 'relative' }}>
      {/* Decorative stickers */}
      <span className="sticker-float" style={{ position: 'absolute', top: -5, right: -5, fontSize: '2rem', pointerEvents: 'none', filter: 'drop-shadow(0 4px 8px rgba(244,114,182,0.2))' }}>🫧</span>
      <span className="sticker-float-reverse" style={{ position: 'absolute', bottom: 0, left: -5, fontSize: '1.8rem', pointerEvents: 'none', filter: 'drop-shadow(0 4px 8px rgba(192,132,252,0.2))' }}>🌸</span>

      <AnimatePresence mode="wait">
        {step === 'ask' && (
          <motion.div key="ask" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                style={{
                  width: 80, height: 80, borderRadius: 24, margin: '0 auto 20px',
                  background: 'linear-gradient(135deg, #FB7185, #F472B6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 12px 40px rgba(244,114,182,0.35), 0 0 50px rgba(251,113,133,0.15)',
                  transform: 'perspective(500px) rotateX(5deg)',
                }}
              >
                <AlertTriangle size={36} color="white" />
              </motion.div>
              <h1 className="section-title">What's overwhelming you? 💜</h1>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>
                It's okay. Let's make it smaller. Pick what's stressing you out.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CATEGORIES.map((cat, i) => (
                <motion.button key={cat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="card card-glow"
                  onClick={() => handleSelect(cat.id)}
                  style={{ cursor: 'pointer', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', width: '100%', fontSize: '1rem', fontFamily: 'var(--font-sans)' }}
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(192,132,252,0.12)' }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{cat.emoji}</span>
                  <span style={{ fontWeight: 600 }}>{cat.label}</span>
                  <ArrowRight size={18} style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }} />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: '80px 0' }}>
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              style={{ fontSize: '3rem', marginBottom: 16 }}>
              💆
            </motion.div>
            <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Take a breath...</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>Creating your rescue plan 🌸</p>
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              style={{
                width: 80, height: 80, borderRadius: '50%', margin: '24px auto 0',
                background: 'radial-gradient(circle, rgba(192,132,252,0.2) 0%, transparent 70%)',
                border: '2px solid rgba(192,132,252,0.15)',
              }} />
          </motion.div>
        )}

        {step === 'plan' && plan && (
          <motion.div key="plan" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div className="float-anim" style={{ fontSize: '2rem', marginBottom: 8 }}>🛟</div>
              <h1 className="section-title">{plan.title}</h1>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>Just 3 tiny steps. You got this. 💪</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
              {plan.steps.map((s, i) => {
                const isDone = doneSteps.includes(i);
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className={`card card-glass ${isDone ? 'glow-success' : ''}`}
                    style={{ padding: 20, opacity: isDone ? 0.6 : 1, borderColor: isDone ? 'rgba(52,211,153,0.4)' : undefined, transition: 'all 0.4s ease' }}
                  >
                    <div style={{ display: 'flex', gap: 14 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                        background: isDone ? 'var(--color-success)' : 'linear-gradient(135deg, rgba(192,132,252,0.1), rgba(244,114,182,0.08))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
                        boxShadow: isDone ? '0 0 15px rgba(52,211,153,0.3)' : '0 0 10px rgba(192,132,252,0.1)',
                        transition: 'all 0.4s ease',
                      }}>
                        {isDone ? '✓' : s.emoji}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 4 }}>STEP {i + 1}</div>
                        <p style={{ fontSize: '0.95rem', lineHeight: 1.5, fontWeight: 500 }}>{s.action}</p>
                        {!isDone && (
                          <button className="btn btn-success btn-sm" style={{ marginTop: 10 }}
                            onClick={() => setDoneSteps([...doneSteps, i])}>
                            Done ✓
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {doneSteps.length === 3 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="card card-gradient glow-success" style={{ textAlign: 'center', padding: 28 }}>
                <div className="float-anim" style={{ fontSize: '2.5rem', marginBottom: 8 }}>💜</div>
                <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 4 }}>You did it!</h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  You just proved you CAN start. The hardest part is over. 🌟
                </p>
              </motion.div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
              <button className="btn btn-secondary" onClick={reset}><RotateCcw size={16} /> Start over</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
