import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff } from 'lucide-react';

const API = 'http://localhost:5000/api';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Store the admin token specifically, not the normal token
      localStorage.setItem('focusflow_admin_token', data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a0a0a', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 440, padding: 32, zIndex: 10 }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16, background: 'rgba(244, 114, 182, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
              color: '#f472b6', border: '1px solid rgba(244, 114, 182, 0.3)'
            }}>
              <Shield size={32} />
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 8, color: 'white' }}>
              Admin Access
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>
              Enter your secure admin credentials to proceed.
            </p>
          </div>

          <form onSubmit={handleLogin} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24, padding: 32, backdropFilter: 'blur(10px)'
          }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 8, color: 'white' }}>Email</label>
              <input 
                className="input" type="email" placeholder="admin@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required 
                style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 8, color: 'white' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  className="input" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  required style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', paddingRight: 44 }} 
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
                  }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ 
                background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', 
                padding: '12px 16px', borderRadius: 8, fontSize: '0.9rem', marginBottom: 24 
              }}>
                {error}
              </div>
            )}

            <button className="btn btn-primary btn-lg" type="submit" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Enter Dashboard'}
            </button>
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <button 
                type="button" 
                onClick={() => navigate('/')} 
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
              >
                Return to main site
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
