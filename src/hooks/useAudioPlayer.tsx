import { useEffect, useRef, useState } from 'react';

interface AudioPlayerOptions {
  volume?: number;
  loop?: boolean;
}

export const useAudioPlayer = () => {
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext on user interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };

    document.addEventListener('click', initAudio, { once: true });
    return () => document.removeEventListener('click', initAudio);
  }, []);

  const playSound = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (isMuted || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  };

  const playUnlockSound = () => {
    playSound(523.25, 0.1, 'sine'); // C5
    setTimeout(() => playSound(659.25, 0.2, 'sine'), 100); // E5
    setTimeout(() => playSound(783.99, 0.3, 'sine'), 200); // G5
  };

  const playErrorSound = () => {
    playSound(200, 0.1, 'square');
    setTimeout(() => playSound(150, 0.2, 'square'), 100);
  };

  const playCoinSound = () => {
    playSound(800, 0.05, 'sine');
    setTimeout(() => playSound(1000, 0.05, 'sine'), 50);
  };

  const playSuccessSound = () => {
    playSound(523.25, 0.1, 'sine');
    setTimeout(() => playSound(659.25, 0.1, 'sine'), 100);
    setTimeout(() => playSound(783.99, 0.1, 'sine'), 200);
    setTimeout(() => playSound(1046.50, 0.3, 'sine'), 300);
  };

  const toggleMute = () => setIsMuted(!isMuted);

  return {
    isMuted,
    toggleMute,
    playUnlockSound,
    playErrorSound,
    playCoinSound,
    playSuccessSound,
  };
};
