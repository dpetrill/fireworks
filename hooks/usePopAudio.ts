import { useEffect, useRef, useCallback } from 'react';

// 🔊 Global Audio Manager for MP3 Audio
const AudioManager = {
  masterVolume: 0.5,
  muted: false,
  isPlaying: false,
  loopTimeout: null as number | null,
  
  setVolume(vol: number) {
    this.masterVolume = vol;
    console.log('AudioManager: Volume set to', vol);
  },
  
  toggleMute() {
    this.muted = !this.muted;
    console.log('AudioManager: Mute toggled to', this.muted);
  },
  
  getEffectiveVolume(): number {
    return this.muted ? 0 : this.masterVolume;
  },

  stopLoop() {
    if (this.loopTimeout) {
      clearTimeout(this.loopTimeout);
      this.loopTimeout = null;
    }
    this.isPlaying = false;
  }
};

export function usePopAudio(soundOn: boolean, volume: number, fireworkSfxOn?: boolean): (pitch?: number, duration?: number, power?: number) => void | string {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    // Create audio element for continuous firework popping sound
    if (!audioRef.current) {
      audioRef.current = new Audio('/fireworkpopping.mp3');
      audioRef.current.preload = 'auto';
      audioRef.current.loop = true; // Enable continuous looping
      audioRef.current.volume = 0.5; // Default volume
    }
  }, []);

  // Start continuous audio when sound is enabled
  useEffect(() => {
    if (soundOn && fireworkSfxOn !== false && audioRef.current) {
      const effectiveVolume = AudioManager.getEffectiveVolume();
      if (effectiveVolume > 0) {
        audioRef.current.volume = volume * effectiveVolume;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [soundOn, fireworkSfxOn, volume]);

  const pop = useCallback((pitch = 600, duration = 0.08, power = 1) => {
    // No longer needed - audio plays continuously
    // This function is kept for compatibility but does nothing
  }, []);

  // Expose AudioManager globally for TopBar access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).AudioManager = AudioManager;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      AudioManager.stopLoop();
    };
  }, []);

  return pop;
}