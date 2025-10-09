import { useEffect, useRef, useCallback } from 'react';

export function usePopAudio(soundOn: boolean, volume: number, fireworkSfxOn?: boolean): (pitch?: number, duration?: number) => void {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!soundOn) return;

    const resumeAudio = () => {
      if (!ctxRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          ctxRef.current = new AudioContext();
        }
      }
      if (ctxRef.current && ctxRef.current.state === 'suspended') {
        ctxRef.current.resume().catch(console.error);
      }
    };
    
    window.addEventListener('pointerdown', resumeAudio, { once: true });
    window.addEventListener('touchstart', resumeAudio, { once: true, passive: true });

    return () => {
        window.removeEventListener('pointerdown', resumeAudio);
        window.removeEventListener('touchstart', resumeAudio);
    };
  }, [soundOn]);

  const pop = useCallback((pitch = 600, duration = 0.08) => {
    if (!soundOn || !ctxRef.current || volume === 0) return;
    if (fireworkSfxOn === false) return;
    
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(console.error);
    }
    
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(pitch, ctx.currentTime);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.6 * volume, ctx.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + duration + 0.02);
  }, [soundOn, volume, fireworkSfxOn]);

  return pop;
}