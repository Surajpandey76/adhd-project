import { useEffect, useRef } from 'react';

export default function MouseLight() {
  const lightRef = useRef(null);

  useEffect(() => {
    const light = lightRef.current;
    if (!light) return;

    const handleMouseMove = (e) => {
      requestAnimationFrame(() => {
        light.style.left = `${e.clientX}px`;
        light.style.top = `${e.clientY}px`;
        light.style.opacity = '1';
      });
    };

    const handleMouseLeave = () => {
      light.style.opacity = '0';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={lightRef}
      className="mouse-light"
      style={{ opacity: 0 }}
    />
  );
}
