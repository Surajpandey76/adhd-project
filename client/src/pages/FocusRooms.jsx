import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Code, Sparkles, Briefcase, Timer, Volume2, VolumeX } from 'lucide-react';

const ROOMS = [
  { id: 'study', name: 'Study Room', emoji: '📚', description: 'Quiet study space', users: 24, icon: BookOpen, gradient: 'linear-gradient(135deg, #C084FC, #D8B4FE)', glow: 'rgba(192,132,252,0.2)' },
  { id: 'coding', name: 'Coding Room', emoji: '💻', description: 'Ship code together', users: 18, icon: Code, gradient: 'linear-gradient(135deg, #F472B6, #F9A8D4)', glow: 'rgba(244,114,182,0.2)' },
  { id: 'cleaning', name: 'Cleaning Room', emoji: '🧹', description: 'Tidy up your space', users: 12, icon: Sparkles, gradient: 'linear-gradient(135deg, #34D399, #6EE7B7)', glow: 'rgba(52,211,153,0.2)' },
  { id: 'job', name: 'Job Application Room', emoji: '💼', description: 'Apply for jobs together', users: 9, icon: Briefcase, gradient: 'linear-gradient(135deg, #FB7185, #FDA4AF)', glow: 'rgba(251,113,133,0.2)' },
  { id: 'focus', name: 'Deep Focus Room', emoji: '🎯', description: 'No distractions allowed', users: 31, icon: Timer, gradient: 'linear-gradient(135deg, #A855F7, #C084FC)', glow: 'rgba(168,85,247,0.2)' },
  { id: 'creative', name: 'Creative Room', emoji: '🎨', description: 'Art, writing, design', users: 15, icon: Sparkles, gradient: 'linear-gradient(135deg, #FBBF24, #FDE68A)', glow: 'rgba(251,191,36,0.2)' },
];

export default function FocusRooms() {
  const [joinedRoom, setJoinedRoom] = useState(null);
  const [timer, setTimer] = useState(0);
  const [muted, setMuted] = useState(false);

  const handleJoin = (room) => {
    setJoinedRoom(room);
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  };

  const handleLeave = () => { setJoinedRoom(null); setTimer(0); };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  if (joinedRoom) {
    const room = ROOMS.find(r => r.id === joinedRoom);
    return (
      <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <motion.div
            animate={{ scale: [1, 1.05, 1], rotateZ: [0, 2, -2, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            style={{
              width: 80, height: 80, borderRadius: 24, margin: '0 auto 20px',
              background: room.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem',
              boxShadow: `0 12px 40px ${room.glow}, 0 0 50px ${room.glow}`,
              transform: 'perspective(500px) rotateX(5deg)',
            }}>
            {room.emoji}
          </motion.div>
          <h1 className="section-title">{room.name}</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
            You're focusing with {room.users + Math.floor(Math.random() * 5)} others 💜
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `hsl(${300 + i * 30}, 60%, 70%)`,
                  border: '3px solid var(--color-surface)',
                  marginLeft: i > 0 ? -8 : 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700, color: 'white',
                  boxShadow: `0 0 10px hsla(${300 + i * 30}, 60%, 70%, 0.3)`,
                }}>
                {String.fromCharCode(65 + i)}
              </motion.div>
            ))}
          </div>

          <div className="card card-glass" style={{ padding: 32, marginBottom: 20 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 8, fontWeight: 600 }}>TIME IN ROOM</div>
            <div className="timer-display timer-glow" style={{ color: 'var(--color-primary)' }}>
              {formatTime(timer)}
            </div>
            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--color-success)', margin: '16px auto 4px', boxShadow: '0 0 10px rgba(52,211,153,0.5)' }} />
            <div style={{ fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 600 }}>Focusing</div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setMuted(!muted)}>
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />} {muted ? 'Unmute' : 'Mute'}
            </button>
            <button className="btn btn-danger" onClick={handleLeave}>Leave Room</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Decorative stickers */}
      <span className="sticker-float" style={{ position: 'absolute', top: -5, right: 0, fontSize: '2rem', pointerEvents: 'none', filter: 'drop-shadow(0 4px 8px rgba(192,132,252,0.2))' }}>👥</span>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title">Focus Rooms 🏠</h1>
        <p className="section-subtitle">Join a room and focus alongside others. Body doubling helps ADHD brains stay on track. 💜</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {ROOMS.map((room, i) => (
          <motion.div key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card room-card card-glow card-shine"
            style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
            whileHover={{ scale: 1.03, boxShadow: `0 12px 35px ${room.glow}` }}
            onClick={() => handleJoin(room.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: room.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                boxShadow: `0 4px 15px ${room.glow}`,
                transform: 'perspective(400px) rotateY(-5deg)',
              }}>
                {room.emoji}
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{room.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{room.description}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                <Users size={14} /> {room.users} focusing now
              </div>
              <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 8px rgba(52,211,153,0.5)' }} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
