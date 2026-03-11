import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';

/* ─── Decorative 3D Stickers ─── */
const STICKERS = [
  { emoji: '🧠', top: '8%', left: '8%', size: '3.2rem', delay: 0, rotate: -12 },
  { emoji: '⚡', top: '12%', right: '10%', size: '2.6rem', delay: 0.5, rotate: 15 },
  { emoji: '🎯', bottom: '18%', left: '6%', size: '2.8rem', delay: 1, rotate: -8 },
  { emoji: '💡', top: '35%', right: '5%', size: '2.4rem', delay: 1.5, rotate: 10 },
  { emoji: '🚀', bottom: '12%', right: '8%', size: '2.5rem', delay: 0.8, rotate: -5 },
  { emoji: '✨', top: '55%', left: '4%', size: '2rem', delay: 1.2, rotate: 20 },
  { emoji: '🔥', bottom: '35%', right: '3%', size: '2.2rem', delay: 0.3, rotate: -18 },
  { emoji: '💜', top: '75%', left: '12%', size: '2rem', delay: 1.8, rotate: 8 },
];

const FloatingSticker = ({ emoji, style, delay, rotate }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, rotate: rotate - 10 }}
    animate={{ opacity: 1, scale: 1, rotate }}
    transition={{ delay: delay + 0.3, type: 'spring', stiffness: 200, damping: 15 }}
    style={{
      position: 'absolute',
      fontSize: style.size || '2.5rem',
      filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.2)) drop-shadow(0 2px 4px rgba(192,132,252,0.3))',
      transform: `perspective(500px) rotateY(${rotate > 0 ? -8 : 8}deg)`,
      pointerEvents: 'none',
      zIndex: 0,
      userSelect: 'none',
      ...style,
    }}
    className="sticker-float"
  >
    {emoji}
  </motion.div>
);

/* ─── Slide Data ─── */
const SLIDES = [
  {
    tag: 'For ADHD brains',
    title: 'Turn Overwhelm\nInto Action',
    desc: 'AI breaks your big scary goals into tiny, dopamine-friendly micro-steps. No more paralysis.',
    visual: (
      <div style={{ position: 'relative', width: 200, height: 200 }}>
        <motion.div
          animate={{ rotateY: [0, 15, 0, -15, 0], scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          style={{
            width: 160, height: 160, borderRadius: 40, margin: '20px auto',
            background: 'linear-gradient(135deg, #C084FC, #F472B6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '5rem',
            boxShadow: '0 20px 60px rgba(192,132,252,0.4), 0 0 80px rgba(244,114,182,0.2), inset 0 -4px 12px rgba(0,0,0,0.1)',
            transform: 'perspective(600px) rotateX(5deg)',
          }}>
          🧠
        </motion.div>
        {/* Orbiting dots */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <motion.div key={i}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8 + i, ease: 'linear' }}
            style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 140 + i * 5, height: 140 + i * 5,
              marginTop: -(70 + i * 2.5), marginLeft: -(70 + i * 2.5),
            }}>
            <div style={{
              position: 'absolute', top: 0, left: '50%',
              width: 6 + i, height: 6 + i, borderRadius: '50%',
              background: `hsl(${280 + i * 15}, 80%, 70%)`,
              boxShadow: `0 0 8px hsl(${280 + i * 15}, 80%, 70%)`,
              transform: `rotate(${deg}deg) translateX(${70 + i * 2.5}px)`,
            }} />
          </motion.div>
        ))}
      </div>
    ),
    gradient: 'linear-gradient(135deg, #C084FC, #F472B6)',
    glow: 'rgba(192,132,252,0.3)',
  },
  {
    tag: 'One step at a time',
    title: 'See Only\nThe Next Step',
    desc: 'No overwhelming lists. Just one clear task at a time. Complete it, earn XP, unlock the next one.',
    visual: (
      <motion.div
        animate={{ rotateZ: [0, 2, -2, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
        style={{ position: 'relative', perspective: 600 }}
      >
        {/* Stack of glass cards */}
        {[2, 1, 0].map(i => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1 - i * 0.25, y: -i * 12 }}
            transition={{ delay: i * 0.15 }}
            style={{
              width: 220, padding: '16px 20px',
              background: `rgba(255,255,255,${0.5 - i * 0.15})`,
              backdropFilter: 'blur(20px)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.3)',
              marginBottom: i === 0 ? 0 : -44,
              boxShadow: `0 ${8 - i * 2}px ${20 - i * 5}px rgba(192,132,252,${0.12 - i * 0.03})`,
              transform: `perspective(600px) rotateX(${i * 3}deg) scale(${1 - i * 0.05})`,
            }}>
            {i === 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C084FC', boxShadow: '0 0 8px rgba(192,132,252,0.5)' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B5B7B' }}>Current Step</span>
                </div>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: 8, color: '#1E1B2E' }}>
                  Research interview questions ✨
                </p>
              </>
            )}
            {i > 0 && (
              <div style={{ height: 28, display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: '60%', height: 8, borderRadius: 4, background: 'rgba(192,132,252,0.1)' }} />
                <div style={{ width: '30%', height: 8, borderRadius: 4, background: 'rgba(192,132,252,0.06)' }} />
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    ),
    gradient: 'linear-gradient(135deg, #F472B6, #FB7185)',
    glow: 'rgba(244,114,182,0.3)',
  },
  {
    tag: 'Gamified rewards',
    title: 'Level Up\nYour Life',
    desc: 'Earn XP, coins, and streaks. Unlock achievements. Your brain gets the dopamine, task by task.',
    visual: (
      <div style={{ position: 'relative' }}>
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotateZ: [0, 3, -3, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          style={{
            width: 180, padding: 20, borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(192,132,252,0.15), rgba(244,114,182,0.1))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 12px 40px rgba(192,132,252,0.2), 0 0 50px rgba(244,114,182,0.1)',
            margin: '0 auto',
          }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 4 }}>👑</div>
            <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#1E1B2E' }}>Level 12</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12 }}>
            {[
              { emoji: '🔥', val: '7', label: 'streak' },
              { emoji: '💎', val: '340', label: 'coins' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: '0.75rem' }}>
                <div style={{ fontSize: '1.2rem' }}>{s.emoji}</div>
                <div style={{ fontWeight: 700, color: '#1E1B2E' }}>{s.val}</div>
                <div style={{ color: '#A78BBF' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{
            height: 6, borderRadius: 3, background: 'rgba(192,132,252,0.15)', marginTop: 12,
            overflow: 'hidden',
          }}>
            <motion.div
              animate={{ width: ['30%', '75%'] }}
              transition={{ duration: 2, delay: 0.5 }}
              style={{
                height: '100%', borderRadius: 3,
                background: 'linear-gradient(90deg, #C084FC, #F472B6)',
                boxShadow: '0 0 8px rgba(192,132,252,0.5)',
              }} />
          </div>
        </motion.div>
        {/* Floating reward emojis */}
        {['⭐', '💫', '✨'].map((e, i) => (
          <motion.div key={i}
            animate={{ y: [-5, -15, -5], x: [0, i % 2 ? 4 : -4, 0] }}
            transition={{ repeat: Infinity, duration: 2 + i * 0.5, delay: i * 0.3 }}
            style={{
              position: 'absolute',
              top: `${10 + i * 25}%`,
              [i % 2 ? 'right' : 'left']: '-10px',
              fontSize: '1.3rem',
              filter: 'drop-shadow(0 2px 6px rgba(192,132,252,0.3))',
            }}>
            {e}
          </motion.div>
        ))}
      </div>
    ),
    gradient: 'linear-gradient(135deg, #FB7185, #C084FC)',
    glow: 'rgba(251,113,133,0.3)',
  },
];

/* ─── Mouse Light Hook ─── */
function useMouseLight(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty('--mouse-x', `${x}px`);
      el.style.setProperty('--mouse-y', `${y}px`);
    };

    el.addEventListener('mousemove', handleMove);
    return () => el.removeEventListener('mousemove', handleMove);
  }, []);
}

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState('onboarding'); // onboarding | auth
  const [form, setForm] = useState({ name: '', email: '', password: '', otp: '' });
  const [isLogin, setIsLogin] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register, sendOtp } = useAuth();
  const containerRef = useRef(null);

  useMouseLight(containerRef);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Intercept admin login on the client login page
      if (isLogin && form.email === 'support.focusflow@gmail.com') {
        const res = await fetch('http://localhost:5000/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        localStorage.setItem('focusflow_admin_token', data.token);
        navigate('/admin');
        setLoading(false);
        return;
      }

      if (isLogin) {
        // Login skips OTP verification
        await login(form.email, form.password);
        navigate('/dashboard');
      } else {
        if (!otpStep) {
          if (!form.name.trim()) { setError('Name is required'); setLoading(false); return; }
          await sendOtp(form.email);
          setOtpStep(true);
        } else {
          // Registration uses OTP verification
          await register(form.name, form.email, form.password, form.otp);
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  /* ═══ AUTH SCREEN ═══ */
  if (mode === 'auth') {
    return (
      <div ref={containerRef} className="onboarding-aurora" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg)', padding: 24,
        '--mouse-x': '50%', '--mouse-y': '50%',
      }}>
        {/* Mouse-tracking glow */}
        <div style={{
          position: 'absolute',
          width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(192,132,252,0.1) 0%, transparent 70%)',
          left: 'var(--mouse-x)', top: 'var(--mouse-y)',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          transition: 'left 0.2s, top 0.2s',
        }} />

        {/* Background Stickers */}
        {STICKERS.slice(0, 5).map((s, i) => (
          <FloatingSticker key={i} emoji={s.emoji} delay={s.delay} rotate={s.rotate}
            style={{ top: s.top, left: s.left, right: s.right, bottom: s.bottom, size: s.size }} />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <motion.div
              animate={{ scale: [1, 1.08, 1], rotateZ: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              style={{
                width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px',
                background: 'linear-gradient(135deg, #C084FC, #F472B6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem',
                boxShadow: '0 12px 40px rgba(192,132,252,0.4), 0 0 60px rgba(244,114,182,0.15)',
                transform: 'perspective(500px) rotateX(5deg)',
              }}>⚡</motion.div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 4 }}>
              {otpStep && !isLogin ? 'Verify your email' : (isLogin ? 'Welcome back' : 'Create your account')}
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              {otpStep && !isLogin ? `Enter the 6-digit code sent to ${form.email}` : (isLogin ? 'Let\'s keep the momentum going 💜' : 'Start your focus journey today ✨')}
            </p>
          </div>

          <form onSubmit={handleAuth} style={{
            background: 'rgba(255,255,255,0.4)',
            backdropFilter: 'blur(24px) saturate(1.5)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
            border: '1px solid rgba(255,255,255,0.35)',
            borderRadius: 22,
            padding: 28,
            boxShadow: '0 8px 40px rgba(192,132,252,0.1), inset 0 1px 0 rgba(255,255,255,0.5)',
          }}>
            {!otpStep && !isLogin && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Name</label>
                <input className="input" placeholder="Your name" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
            )}
            {(!otpStep || isLogin) && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label>
                  <input className="input" type="email" placeholder="you@example.com" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input className="input" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                      value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                      required minLength={6} style={{ paddingRight: 44 }} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)',
                      }}>
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {otpStep && !isLogin && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Verification Code</label>
                <input className="input" type="text" placeholder="123456" value={form.otp}
                  onChange={e => setForm({ ...form, otp: e.target.value })} required minLength={6} maxLength={6}
                  style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.2rem' }} />
              </div>
            )}

            {error && (
              <div style={{
                background: 'rgba(251,113,133,0.1)', color: 'var(--color-danger)',
                padding: '8px 12px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 16,
                backdropFilter: 'blur(8px)',
              }}>{error}</div>
            )}

            <button className="btn btn-primary btn-lg" type="submit"
              style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Please wait...' : (otpStep ? 'Verify & Continue' : (isLogin ? 'Log in' : 'Create account'))}
            </button>

            {!otpStep && (
              <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                {isLogin ? 'Don\'t have an account? ' : 'Already have an account? '}
                <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }}
                  style={{
                    background: 'none', border: 'none', color: 'var(--color-primary)',
                    fontWeight: 600, cursor: 'pointer',
                  }}>
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </p>
            )}
            {otpStep && (
              <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                <button type="button" onClick={() => { setOtpStep(false); setError(''); }}
                  style={{
                    background: 'none', border: 'none', color: 'var(--color-primary)',
                    fontWeight: 600, cursor: 'pointer',
                  }}>
                  ← Back to login
                </button>
              </p>
            )}
          </form>
        </motion.div>
      </div>
    );
  }

  /* ═══ ONBOARDING SLIDES ═══ */
  const slide = SLIDES[step];

  return (
    <div ref={containerRef} className="onboarding-aurora" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg)', padding: 24,
      '--mouse-x': '50%', '--mouse-y': '50%',
    }}>
      {/* Mouse-tracking glow */}
      <div style={{
        position: 'absolute',
        width: 600, height: 600,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${slide.glow} 0%, transparent 70%)`,
        left: 'var(--mouse-x)', top: 'var(--mouse-y)',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        transition: 'left 0.15s ease-out, top 0.15s ease-out',
        mixBlendMode: 'screen',
      }} />

      {/* Floating 3D Stickers */}
      {STICKERS.map((s, i) => (
        <FloatingSticker key={i} emoji={s.emoji} delay={s.delay} rotate={s.rotate}
          style={{ top: s.top, left: s.left, right: s.right, bottom: s.bottom, size: s.size }} />
      ))}

      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 60, filter: 'blur(8px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -60, filter: 'blur(8px)' }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Tag */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                display: 'inline-flex', padding: '6px 16px', borderRadius: 9999,
                background: 'rgba(192,132,252,0.1)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(192,132,252,0.2)',
                fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-primary-dark)',
                marginBottom: 24,
              }}>
              {slide.tag}
            </motion.div>

            {/* 3D Visual */}
            <div style={{ marginBottom: 28 }}>
              {slide.visual}
            </div>

            {/* Title */}
            <h1 className="holo-text" style={{
              fontSize: '2.2rem', fontWeight: 800, marginBottom: 14,
              whiteSpace: 'pre-line', lineHeight: 1.2,
            }}>
              {slide.title}
            </h1>

            {/* Description */}
            <p style={{
              color: 'var(--color-text-secondary)', fontSize: '1.05rem',
              lineHeight: 1.6, maxWidth: 380, margin: '0 auto',
            }}>
              {slide.desc}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Dots — Glass Capsule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            display: 'inline-flex', gap: 8, margin: '36px 0 28px',
            padding: '8px 16px', borderRadius: 9999,
            background: 'rgba(255,255,255,0.35)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.3)',
          }}>
          {SLIDES.map((_, i) => (
            <motion.div key={i}
              animate={{ width: i === step ? 24 : 8, opacity: i === step ? 1 : 0.4 }}
              style={{
                height: 8,
                borderRadius: 4,
                background: i === step ? slide.gradient : 'rgba(192,132,252,0.3)',
                boxShadow: i === step ? `0 0 12px ${slide.glow}` : 'none',
                cursor: 'pointer',
              }}
              onClick={() => setStep(i)}
            />
          ))}
        </motion.div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          {step > 0 && (
            <motion.button className="btn btn-secondary" onClick={() => setStep(step - 1)}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <ArrowLeft size={18} /> Back
            </motion.button>
          )}
          {step < SLIDES.length - 1 ? (
            <motion.button className="btn btn-primary btn-lg" onClick={() => setStep(step + 1)}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              Next <ArrowRight size={18} />
            </motion.button>
          ) : (
            <motion.button className="btn btn-primary btn-lg" onClick={() => setMode('auth')}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              Get Started <ArrowRight size={18} />
            </motion.button>
          )}
        </div>

        {step === 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={() => setMode('auth')}
            style={{
              marginTop: 16, background: 'none', border: 'none',
              color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.85rem',
            }}>
            Skip to sign in →
          </motion.button>
        )}
      </div>
    </div>
  );
}
