import { createContext, useContext, useState, useCallback } from 'react';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [celebration, setCelebration] = useState(false);
  const [levelUp, setLevelUp] = useState(false);

  const showToast = useCallback((message, duration = 3000) => {
    setToast(message);
    setTimeout(() => setToast(null), duration);
  }, []);

  const triggerCelebration = useCallback(() => {
    setCelebration(true);
    setTimeout(() => setCelebration(false), 2000);
  }, []);

  const triggerLevelUp = useCallback((level) => {
    setLevelUp(level);
    setTimeout(() => setLevelUp(false), 3000);
  }, []);

  return (
    <GameContext.Provider value={{ toast, showToast, celebration, triggerCelebration, levelUp, triggerLevelUp }}>
      {children}
      {/* Toast */}
      {toast && (
        <div className="toast" style={{ animation: 'slide-up-fade 0.3s ease' }}>
          {toast}
        </div>
      )}
      {/* Level Up Modal — Holographic glass */}
      {levelUp && (
        <div style={{
          position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', zIndex: 2000,
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(192,132,252,0.85), rgba(244,114,182,0.85))',
            backdropFilter: 'blur(24px)',
            borderRadius: 28, padding: '48px 56px', textAlign: 'center', color: 'white',
            boxShadow: '0 0 60px rgba(192,132,252,0.5), 0 0 120px rgba(244,114,182,0.2)',
            border: '1px solid rgba(255,255,255,0.25)',
            animation: 'slide-up-fade 0.4s ease',
            transform: 'perspective(500px) rotateX(3deg)',
          }}>
            <div className="float-anim" style={{ fontSize: '3rem', marginBottom: 8 }}>🎉</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>Level Up!</h2>
            <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>You reached Level {levelUp} 👑</p>
          </div>
        </div>
      )}
      {/* Celebration Particles */}
      {celebration && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1500 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="celebration-particle" style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${60 + Math.random() * 30}%`,
              fontSize: `${16 + Math.random() * 20}px`,
              animationDelay: `${Math.random() * 0.5}s`,
            }}>
              {['✨', '⭐', '🌟', '💫', '🎯', '💜', '💎'][Math.floor(Math.random() * 7)]}
            </div>
          ))}
        </div>
      )}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
