import { useEffect, useRef } from 'react';

const ParallaxBackground = () => {
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const layer3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const moveX = (clientX - centerX) / centerX;
      const moveY = (clientY - centerY) / centerY;

      if (layer1Ref.current) {
        layer1Ref.current.style.transform = `translate(${moveX * 10}px, ${moveY * 10}px)`;
      }
      if (layer2Ref.current) {
        layer2Ref.current.style.transform = `translate(${moveX * 20}px, ${moveY * 20}px)`;
      }
      if (layer3Ref.current) {
        layer3Ref.current.style.transform = `translate(${moveX * 30}px, ${moveY * 30}px)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Background layer - deepest */}
      <div
        ref={layer1Ref}
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--accent) / 0.1) 0%, transparent 70%)',
        }}
      />

      {/* Middle layer - floating particles */}
      <div
        ref={layer2Ref}
        className="absolute inset-0 transition-transform duration-500 ease-out"
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Foreground layer - large glimmers */}
      <div
        ref={layer3Ref}
        className="absolute inset-0 transition-transform duration-700 ease-out"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full animate-glow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ParallaxBackground;
