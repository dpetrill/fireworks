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
  const largeExplosionAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for regular fireworks sound
    if (!audioRef.current) {
      audioRef.current = new Audio('/firework.mp3');
      audioRef.current.preload = 'auto';
      audioRef.current.loop = true; // Enable looping
      audioRef.current.volume = 0.5; // Default volume
    }

    // Create audio element for large explosions (200%+ power)
    if (!largeExplosionAudioRef.current) {
      largeExplosionAudioRef.current = new Audio('/Largerthan150percent.mp3');
      largeExplosionAudioRef.current.preload = 'auto';
      largeExplosionAudioRef.current.loop = false; // Play once through
      largeExplosionAudioRef.current.volume = 0.5; // Default volume
    }
  }, []);

  const pop = useCallback((pitch = 600, duration = 0.08, power = 1) => {
    console.log('Audio check:', { soundOn, volume, fireworkSfxOn, muted: AudioManager.muted, power });
    
    // Check if sound should play
    if (!soundOn || fireworkSfxOn === false) return;
    
    // Use global audio manager for mute control
    const effectiveVolume = AudioManager.getEffectiveVolume();
    if (effectiveVolume === 0) return;
    
    // Check if this is a large explosion (100%+ power)
    if (power >= 1.0 && largeExplosionAudioRef.current) {
      // Play the special large explosion audio
      largeExplosionAudioRef.current.volume = volume * effectiveVolume;
      largeExplosionAudioRef.current.currentTime = 0;
      largeExplosionAudioRef.current.play().catch(console.error);
      
      // Return a special flag to indicate this needs a timed rocket
      return 'LARGE_EXPLOSION';
    }
    
    // Regular explosion audio (for power < 200%)
    if (!audioRef.current) return;

    // Set volume based on user settings and global mute
    audioRef.current.volume = volume * effectiveVolume;
    
    // If not already playing, start the audio loop
    if (!AudioManager.isPlaying) {
      AudioManager.isPlaying = true;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
      
      // Stop the loop after 5-10 seconds (random duration)
      const loopDuration = Math.random() * 5000 + 5000; // 5-10 seconds
      AudioManager.loopTimeout = window.setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        AudioManager.isPlaying = false;
        AudioManager.loopTimeout = null;
      }, loopDuration);
    }
  }, [soundOn, volume, fireworkSfxOn]);

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