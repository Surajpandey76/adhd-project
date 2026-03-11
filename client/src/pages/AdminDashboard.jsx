import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, Bell, Shield, ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifyState, setNotifyState] = useState({ id: null, status: '' });
  
  const navigate = useNavigate();
  // Fetch specific admin token
  const adminToken = localStorage.getItem('focusflow_admin_token');

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    fetchUsers();
  }, [adminToken, navigate]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('focusflow_admin_token');
        navigate('/admin/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const notifyUser = async (userId) => {
    setNotifyState({ id: userId, status: 'sending' });
    try {
      const res = await fetch(`${API}/admin/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ userId, message: 'Time to focus! Let\'s get back to work. ⚡' })
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('focusflow_admin_token');
        navigate('/admin/login');
        return;
      }
      if (!res.ok) throw new Error('User offline or error');
      setNotifyState({ id: userId, status: 'success' });
      setTimeout(() => setNotifyState({ id: null, status: '' }), 3000);
    } catch (err) {
      setNotifyState({ id: userId, status: 'error' });
      setTimeout(() => setNotifyState({ id: null, status: '' }), 3000);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      const res = await fetch(`${API}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('focusflow_admin_token');
        navigate('/admin/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to delete user');
      
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div style={{ padding: 40, color: 'white' }}>Loading admin data...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white', padding: 40 }}>
      {/* Admin Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 32px', background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, marginBottom: 32
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: 'rgba(244, 114, 182, 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f472b6'
          }}>
            <Shield size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Admin Control Panel</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.9rem' }}>Monitor users and manage focus states</p>
          </div>
        </div>
        
        <button className="btn" onClick={() => navigate('/dashboard')} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <ArrowLeft size={18} /> Exit Admin
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: 16, borderRadius: 12, marginBottom: 24 }}>
          {error}
        </div>
      )}

      {/* Users Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
        {users.map(user => (
          <motion.div key={user.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 16
            }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{user.name}</h3>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Users size={14} /> {user.email}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600 }}>
                  Lvl {user.level}
                </div>
                <button 
                  onClick={() => deleteUser(user.id)}
                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: 6, borderRadius: 8, cursor: 'pointer', display: 'flex' }}
                  title="Delete User"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 12, display: 'flex', gap: 12, alignItems: 'center',
              borderLeft: '4px solid ' + (user.currentActivity === 'Idle' ? '#6b7280' : 'var(--color-primary)')
            }}>
              <Activity size={18} color={user.currentActivity === 'Idle' ? '#6b7280' : 'var(--color-primary)'} />
              <div style={{ fontSize: '0.9rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', marginRight: 6 }}>Current Status:</span>
                <span style={{ fontWeight: 500, color: user.currentActivity === 'Idle' ? '#9ca3af' : 'white' }}>
                  {user.currentActivity}
                </span>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 8, marginTop: 'auto' }}
              onClick={() => notifyUser(user.id)}
              disabled={notifyState.id === user.id && notifyState.status === 'sending'}
            >
              <Bell size={18} />
              {notifyState.id === user.id ? (
                notifyState.status === 'sending' ? 'Sending...' :
                notifyState.status === 'success' ? 'Sent!' : 'Failed (Offline)'
              ) : 'Push Focus Notification'}
            </button>
            
          </motion.div>
        ))}
        {users.length === 0 && <p>No users found.</p>}
      </div>
    </div>
  );
}
