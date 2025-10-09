import { useState, useRef, useCallback, useEffect } from 'react';

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMusicLoaded, setIsMusicLoaded] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicError, setMusicError] = useState<string | null>(null);

  // FIX: Moved `handleError` outside of `useEffect` so it can be used by `togglePlayback`.
  // Wrapped in `useCallback` to maintain a stable reference for dependency arrays.
  const handleError = useCallback(() => {
    setIsMusicLoaded(false);
    setIsMusicPlaying(false);
    setMusicError('Error: This link is not a direct audio source or is blocked by security policies (CORS).');
  }, []);

  useEffect(() => {
    // Ensure we have a single audio element instance
    if (!audioRef.current) {
        audioRef.current = new Audio();
    }

    const audioEl = audioRef.current;
    
    const handleCanPlay = () => {
      setIsMusicLoaded(true);
      setMusicError(null);
      audioEl.play().catch(() => {
        // Autoplay was prevented, user needs to initiate
        setIsMusicPlaying(false);
      });
    };
    
    const handlePlay = () => setIsMusicPlaying(true);
    const handlePause = () => setIsMusicPlaying(false);
    
    audioEl.addEventListener('canplaythrough', handleCanPlay);
    audioEl.addEventListener('error', handleError);
    audioEl.addEventListener('play', handlePlay);
    audioEl.addEventListener('pause', handlePause);
    
    // Cleanup
    return () => {
      audioEl.removeEventListener('canplaythrough', handleCanPlay);
      audioEl.removeEventListener('error', handleError);
      audioEl.removeEventListener('play', handlePlay);
      audioEl.removeEventListener('pause', handlePause);
      audioEl.pause();
      audioEl.src = '';
    };
  }, [handleError]);

  const loadUrl = useCallback((url: string) => {
    if (audioRef.current) {
      setIsMusicLoaded(false);
      setIsMusicPlaying(false);
      setMusicError(null);
      audioRef.current.src = url;
      audioRef.current.load();
    }
  }, []);

  const togglePlayback = useCallback(() => {
    if (isMusicLoaded && audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(handleError);
      }
    }
  }, [isMusicLoaded, isMusicPlaying, handleError]);
  
  const setVolume = useCallback((volume: number) => {
      if (audioRef.current) {
          audioRef.current.volume = volume;
      }
  }, []);

  const clearError = useCallback(() => {
    setMusicError(null);
  }, []);

  return {
    isMusicLoaded,
    isMusicPlaying,
    musicError,
    loadUrl,
    togglePlayback,
    setVolume,
    clearError,
  };
};
