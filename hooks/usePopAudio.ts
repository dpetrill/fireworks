import { useEffect, useRef, useCallback } from 'react';

// 🔊 Global Audio Manager for MP3 Audio
const AudioManager = {
  masterVolume: 0.5,
  muted: false,
  
  setVolume(vol: number) {
    this.masterVolume = vol;
  },
  
  toggleMute() {
    this.muted = !this.muted;
    console.log('AudioManager: Mute toggled to', this.muted);
  },
  
  getEffectiveVolume(): number {
    return this.muted ? 0 : this.masterVolume;
  }
};

export function usePopAudio(soundOn: boolean, volume: number, fireworkSfxOn?: boolean): (pitch?: number, duration?: number) => void {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for the fireworks sound
    if (!audioRef.current) {
      audioRef.current = new Audio('/fireworks-29629.mp3');
      audioRef.current.preload = 'auto';
      audioRef.current.volume = 0.5; // Default volume
    }
  }, []);

  const pop = useCallback((pitch = 600, duration = 0.08) => {
    console.log('Audio check:', { soundOn, volume, fireworkSfxOn, muted: AudioManager.muted });
    
    // Use global audio manager for mute control
    const effectiveVolume = AudioManager.getEffectiveVolume();
    if (effectiveVolume === 0) return;
    
    if (!soundOn || volume === 0) return;
    if (fireworkSfxOn === false) return;
    
    if (!audioRef.current) return;

    // Set volume based on user settings and global mute
    audioRef.current.volume = volume * effectiveVolume;
    
    // Reset to beginning and play
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(console.error);
  }, [soundOn, volume, fireworkSfxOn]);

  // Expose AudioManager globally for TopBar access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).AudioManager = AudioManager;
    }
  }, []);

  return pop;
}