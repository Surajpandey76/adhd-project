import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, CheckCircle, Clock, Zap, ChevronDown, ChevronUp } from 'lucide-react';

export default function FocusMode() {
  const location = useLocation();
  const navigate = useNavigate();
  const { authFetch, updateUser } = useAuth();
  const { showToast, triggerCelebration, triggerLevelUp } = useGame();

  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentSubtask, setCurrentSubtask] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [showTaskList, setShowTaskList] = useState(false);
  const [completing, setCompleting] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    authFetch('/api/tasks').then(r => r.json()).then(data => {
      const active = data.filter(t => t.status === 'active');
      setTasks(active);
      const targetId = location.state?.taskId;
      if (targetId) {
        const found = active.find(t => t.id === targetId);
        if (found) selectTask(found);
      } else if (active.length > 0) {
        selectTask(active[0]);
      }
    });
  }, []);

  const selectTask = (task) => {
    setSelectedTask(task);
    const next = task.subtasks?.find(s => s.status === 'pending');
    setCurrentSubtask(next || null);
    setShowTaskList(false);
  };

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerRunning]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const startTimer = async () => {
    setTimerRunning(true);
    try {
      const res = await authFetch('/api/focus/start', {
        method: 'POST',
        body: JSON.stringify({ taskId: selectedTask?.id }),
      });
      const data = await res.json();
      setSessionId(data.id);
    } catch {}
  };

  const pauseTimer = () => setTimerRunning(false);

  const completeSubtask = async () => {
    if (!currentSubtask || completing) return;
    setCompleting(true);
    try {
      const res = await authFetch(`/api/tasks/subtasks/${currentSubtask.id}/complete`, { method: 'PUT' });
      const data = await res.json();
      updateUser(data.user);
      if (data.leveledUp) triggerLevelUp(data.user.level);
      triggerCelebration();
      showToast(`+${data.xpEarned} XP  +${data.coinsEarned} coins 🎉`);

      if (data.goalCompleted) {
        if (sessionId) {
          await authFetch(`/api/focus/${sessionId}/end`, {
            method: 'PUT',
            body: JSON.stringify({ duration: seconds }),
          });
        }
        setTimerRunning(false);
        showToast('🎉 Goal completed! Amazing work!');
        setTimeout(() => navigate('/dashboard'), 2500);
      } else {
        const res2 = await authFetch('/api/tasks').then(r => r.json());
        const active = res2.filter(t => t.status === 'active');
        setTasks(active);
        const updated = active.find(t => t.id === selectedTask.id);
        if (updated) {
          setSelectedTask(updated);
          const next = updated.subtasks?.find(s => s.status === 'pending');
          setCurrentSubtask(next || null);
        }
      }
    } catch {}
    setCompleting(false);
  };

  if (!selectedTask) {
    return (
      <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center', paddingTop: 60, position: 'relative' }}>
        {/* Scribble stickers for empty state */}
        <span className="sticker-float" style={{ position: 'absolute', top: 20, right: 10, fontSize: '2rem', pointerEvents: 'none', filter: 'drop-shadow(0 4px 8px rgba(192,132,252,0.2))' }}>🧘</span>
        <span className="sticker-float-reverse" style={{ position: 'absolute', bottom: 20, left: 10, fontSize: '1.8rem', pointerEvents: 'none', filter: 'drop-shadow(0 4px 8px rgba(244,114,182,0.2))' }}>✨</span>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="float-anim" style={{ fontSize: '3rem', marginBottom: 16 }}>🎯</div>
          <h1 className="section-title">No active goals</h1>
          <p className="section-subtitle">Add a goal first to start focusing. 💜</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/add-goal')}>
            Add a Goal
          </button>
        </motion.div>
      </div>
    );
  }

  const progress = selectedTask.totalCount > 0
    ? (selectedTask.completedCount / selectedTask.totalCount) * 100 : 0;

  return (
    <div style={{ maxWidth: 540, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowTaskList(!showTaskList)} style={{ fontSize: '0.8rem', gap: 4 }}>
            {showTaskList ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Switch Goal
          </button>
        </div>

        {showTaskList && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="card card-glass" style={{ marginBottom: 16, padding: 12 }}>
            {tasks.map(t => (
              <button key={t.id} className={`nav-item ${t.id === selectedTask.id ? 'active' : ''}`}
                onClick={() => selectTask(t)} style={{ marginBottom: 4 }}>
                {t.goal}
              </button>
            ))}
          </motion.div>
        )}

        {/* Main Focus Area */}
        <div className="card card-glass" style={{ textAlign: 'center', padding: '40px 24px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
          {/* Decorative corner sticker */}
          <span className="sticker-float" style={{ position: 'absolute', top: 12, right: 16, fontSize: '1.5rem', pointerEvents: 'none', filter: 'drop-shadow(0 3px 6px rgba(192,132,252,0.2))' }}>⚡</span>

          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {selectedTask.goal}
          </div>
          <div className="xp-bar" style={{ height: 4, marginBottom: 16, maxWidth: 200, margin: '0 auto 16px' }}>
            <div className="xp-bar-fill" style={{ width: `${progress}%` }} />
          </div>

          <AnimatePresence mode="wait">
            {currentSubtask ? (
              <motion.div key={currentSubtask.id}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: 8 }}>
                  STEP {currentSubtask.order} OF {selectedTask.totalCount}
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 24, lineHeight: 1.4 }}>
                  {currentSubtask.title}
                </h2>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="float-anim" style={{ fontSize: '2rem', marginBottom: 8 }}>🎉</div>
                <h2 style={{ fontWeight: 700 }}>All steps completed!</h2>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={`timer-display ${timerRunning ? 'timer-glow' : ''}`} style={{ margin: '20px 0', color: timerRunning ? 'var(--color-primary)' : undefined }}>
            {formatTime(seconds)}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {!timerRunning ? (
              <button className="btn btn-primary btn-lg pulse-glow" onClick={startTimer}>
                <Play size={20} /> Start Focus
              </button>
            ) : (
              <button className="btn btn-secondary btn-lg" onClick={pauseTimer}>
                <Pause size={20} /> Pause
              </button>
            )}
            {currentSubtask && (
              <button className="btn btn-success btn-lg" onClick={completeSubtask} disabled={completing}>
                <CheckCircle size={20} /> {completing ? 'Saving...' : 'Done ✓'}
              </button>
            )}
          </div>
        </div>

        {/* Step Progress */}
        <div className="card card-glass" style={{ padding: 16 }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 12 }}>Progress</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {selectedTask.subtasks?.map((st) => (
              <div key={st.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 8,
                background: st.id === currentSubtask?.id ? 'rgba(192,132,252,0.08)' : 'transparent',
                opacity: st.status === 'completed' ? 0.5 : 1,
                transition: 'all 0.3s ease',
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  border: st.status === 'completed' ? 'none' : '2px solid var(--color-border)',
                  background: st.status === 'completed' ? 'var(--color-success)' :
                    st.id === currentSubtask?.id ? 'var(--color-primary)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: st.id === currentSubtask?.id ? '0 0 10px rgba(192,132,252,0.4)' :
                    st.status === 'completed' ? '0 0 8px rgba(52,211,153,0.3)' : 'none',
                  transition: 'all 0.3s ease',
                }}>
                  {st.status === 'completed' && <CheckCircle size={14} color="white" />}
                  {st.id === currentSubtask?.id && st.status !== 'completed' && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />
                  )}
                </div>
                <span style={{
                  fontSize: '0.82rem',
                  textDecoration: st.status === 'completed' ? 'line-through' : 'none',
                  fontWeight: st.id === currentSubtask?.id ? 600 : 400,
                }}>
                  {st.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
