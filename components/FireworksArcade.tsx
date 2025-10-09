import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { Mode, Target, Tilt } from '../types';
import { PALETTES, FIREWORK_TYPES, clamp, rand, choice } from '../constants';
import { Firework, Rocket, Particle } from '../lib/fireworks';
import { usePopAudio } from '../hooks/usePopAudio';
import TopBar from './TopBar';
import Ad from './Ad';
import TermsPage from './TermsPage';

// Type for ad button states
type AdStatus = 'idle' | 'loading' | 'error';

// FIX: Declare the global adjuice object from the AdJuice SDK script to resolve the "Cannot find name 'adjuice'" error.
declare const adjuice: any;

// --- Main Component ---
const FireworksArcade: React.FC = () => {
  // --- State ---
  const [mode, setMode] = useState<Mode>('show');
  const [running, setRunning] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [fireworkSfxOn, setFireworkSfxOn] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [autoShow, setAutoShow] = useState(true);
  const [gravity, setGravity] = useState(0.045);
  const [palette, setPalette] = useState(0);
  const [fireworkType, setFireworkType] = useState('random');
  const [finaleDuration, setFinaleDuration] = useState(5);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [largeExplosionRocket, setLargeExplosionRocket] = useState<Rocket | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const holdIntervalRef = useRef<number | null>(null);

  // Arcade mode state
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(60);
  const [best, setBest] = useState(() => Number(localStorage.getItem('fw_best_score') || 0));
  const [continuedGame, setContinuedGame] = useState(false);
  const [megaBombAvailable, setMegaBombAvailable] = useState(true);
  const [hasMegaBomb, setHasMegaBomb] = useState(false);

  // Ad states
  const [continueAdState, setContinueAdState] = useState<AdStatus>('idle');
  const [megaBombAdState, setMegaBombAdState] = useState<AdStatus>('idle');
  const [isAdSdkReady, setIsAdSdkReady] = useState(false);


  // --- Refs ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const rocketsRef = useRef<Rocket[]>([]);
  const fireworksRef = useRef<Firework[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const targetsRef = useRef<Target[]>([]);
  const lastTimeRef = useRef(performance.now());
  const autoShowTimerRef = useRef(0);
  // FIX: Pass an initial value to `useRef` to resolve the "Expected 1 arguments, but got 0" error.
  const arcadeTimerRef = useRef<number | undefined>(undefined);
  // FIX: Pass an initial value to `useRef` to resolve the "Expected 1 arguments, but got 0" error.
  const targetTimerRef = useRef<number | undefined>(undefined);
  const tiltRef = useRef<Tilt>({ gx: 0, gy: 0 });
  const pointerDownInfoRef = useRef<{ time: number, x: number, y: number } | null>(null);
  
  // Refs for state values needed in gameLoop to prevent stale closures
  const runningRef = useRef(running);
  useEffect(() => { runningRef.current = running; }, [running]);
  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  const autoShowRef = useRef(autoShow);
  useEffect(() => { autoShowRef.current = autoShow; }, [autoShow]);
  const fireworkTypeRef = useRef(fireworkType);
  useEffect(() => { fireworkTypeRef.current = fireworkType; }, [fireworkType]);


  // --- Audio ---
  const pop = usePopAudio(soundOn, volume, fireworkSfxOn);
  
  // --- AdJuice SDK Readiness Check ---
  useEffect(() => {
    const isSdkReady = () => {
      // FIX: Use the declared global 'adjuice' variable for consistency and to avoid '@ts-ignore'.
      return typeof adjuice !== 'undefined' && typeof adjuice.showAd === 'function';
    }

    if (isSdkReady()) {
      setIsAdSdkReady(true);
      return;
    }

    const intervalId = setInterval(() => {
      if (isSdkReady()) {
        setIsAdSdkReady(true);
        clearInterval(intervalId);
      }
    }, 200); // Check every 200ms

    // Cleanup on component unmount
    return () => clearInterval(intervalId);
  }, []);


  // --- Canvas & Rendering ---
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctxRef.current = ctx;
  }, []);

  useEffect(() => {
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, [setupCanvas]);

  const drawParticle = useCallback((p: Particle) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const lifeRatio = Math.max(0, 1 - p.t / p.life);
    ctx.globalAlpha = lifeRatio;
    ctx.fillStyle = p.color;
    ctx.save();
    ctx.translate(p.x, p.y);
    
    if (p.shape === 'star') {
        ctx.rotate(p.t * p.spin * 20);
        ctx.scale(lifeRatio, lifeRatio);
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const outerRadius = p.size * 2;
            const innerRadius = p.size;
            ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
            const nextAngle = ((i + 0.5) / 5) * Math.PI * 2;
            ctx.lineTo(Math.cos(nextAngle) * innerRadius, Math.sin(nextAngle) * innerRadius);
        }
        ctx.closePath();
        ctx.fill();
    } else if (p.shape === 'square') {
        ctx.rotate(p.t * p.spin * 10);
        ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
    } else if (p.shape === 'line') {
        ctx.rotate(Math.atan2(p.vy, p.vx));
        ctx.fillRect(-p.size * 2.5, -p.size / 2, p.size * 5, p.size);
    } else { // dot
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
  }, []);

  const drawRocket = useCallback((r: Rocket) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    r.render(ctx);
  }, []);
  
  const drawTarget = useCallback((t: Target) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const lifeRatio = clamp(t.life / 2, 0.2, 1);
      const pulse = Math.sin(t.t * 5) * 0.1 + 1;
      ctx.strokeStyle = `rgba(255, 255, 255, ${lifeRatio * 0.7})`;
      ctx.fillStyle = `rgba(255, 255, 255, ${lifeRatio * 0.1})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
  }, []);

  const gameLoop = useCallback((time: number) => {
    if (!runningRef.current) {
      lastTimeRef.current = time;
      requestAnimationFrame(gameLoop);
      return;
    }
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const dt = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;

    // --- Update ---
    const effectiveGravity = gravity + tiltRef.current.gy * 0.2;
    const wind = tiltRef.current.gx * 0.2;

    // Auto-launch rockets only in show mode
    if (modeRef.current === 'show' && autoShowRef.current) {
      autoShowTimerRef.current -= dt;
      if (autoShowTimerRef.current <= 0) {
        rocketsRef.current.push(new Rocket(width, height, PALETTES));
        autoShowTimerRef.current = rand(0.4, 1.2);
      }
    }
    
    // Step all physics objects
    rocketsRef.current.forEach(r => r.step(dt, effectiveGravity, height));
    fireworksRef.current.forEach(f => f.step(dt, effectiveGravity));
    particlesRef.current.forEach(p => {
        p.step(dt, effectiveGravity);
        p.vx += wind * dt * 60;
    });

    // Handle Arcade Target Lifecycle
    if (modeRef.current === 'arcade') {
        targetsRef.current.forEach(t => {
            t.life -= dt;
            t.t += dt;
            if (t.life <= 0) t.dead = true;
        });
    }

    // Handle rocket explosions (Optimized Logic)
    const newFireworks: Firework[] = [];
    const explodingRockets = rocketsRef.current.filter(r => r.exploded);
    
    if (explodingRockets.length > 0) {
        let scoreChange = 0;
        const EXPLOSION_RADIUS = 50; // Give explosions a blast radius

        explodingRockets.forEach(r => {
            const explosionX = r.targetX ?? r.x;
            const explosionY = r.targetY ?? r.y;
            const selectedType = fireworkTypeRef.current === 'random' ? choice(FIREWORK_TYPES) : fireworkTypeRef.current;
            newFireworks.push(new Firework(explosionX, explosionY, PALETTES[palette], 1, selectedType));
            pop(rand(200, 800), 0.08, 1);

            if (modeRef.current === 'arcade') {
                let rocketHitSomething = false;
                targetsRef.current.forEach(t => {
                    if (t.dead) return;
                    const dist = Math.hypot(explosionX - t.x, explosionY - t.y);
                    if (dist < t.r + EXPLOSION_RADIUS) {
                        rocketHitSomething = true;
                        scoreChange += Math.ceil(t.r * (t.life / 2));
                        t.dead = true;
                    }
                });
                if (!rocketHitSomething) {
                    scoreChange -= 5; // Penalty for missing
                }
            }
        });

        fireworksRef.current.push(...newFireworks);
        
        if (modeRef.current === 'arcade' && scoreChange !== 0) {
            setScore(s => Math.max(0, s + scoreChange));
        }
    }

    // Filter out dead objects
    rocketsRef.current = rocketsRef.current.filter(r => !r.exploded);
    fireworksRef.current = fireworksRef.current.filter(f => !f.done);
    particlesRef.current = particlesRef.current.filter(p => p.alive);
    if (modeRef.current === 'arcade') {
        targetsRef.current = targetsRef.current.filter(t => !t.dead);
    }

    // --- Draw ---
    ctx.globalCompositeOperation = 'source-over';
    // In paint mode, use a very light overlay to create paint trail effect
    // In other modes, use normal clearing
    ctx.fillStyle = `rgba(0, 0, 0, ${modeRef.current === 'paint' ? 0.02 : 0.18})`;
    ctx.fillRect(0, 0, width, height);
    
    ctx.globalCompositeOperation = 'lighter';
    rocketsRef.current.forEach(drawRocket);
    fireworksRef.current.forEach(f => f.particles.forEach(drawParticle));
    particlesRef.current.forEach(drawParticle);
    if (modeRef.current === 'arcade') {
        targetsRef.current.forEach(drawTarget);
    }

    // Draw charge indicator
    const pointerInfo = pointerDownInfoRef.current;
    if ((modeRef.current === 'paint' || modeRef.current === 'show') && pointerInfo) {
      const duration = time - pointerInfo.time;
      const power = clamp(duration / 1000, 0, 1); // 0 to 100% over 1 second
      const percent = Math.floor(power * 100);

      const { x, y } = pointerInfo;
      const radius = 20 + power * 30; // Circle grows with power from 20 to 50

      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${percent}%`, x, y);
      ctx.globalAlpha = 1.0; // Reset alpha
    }
    
    requestAnimationFrame(gameLoop);
  }, [gravity, palette, pop, drawParticle, drawRocket, drawTarget]);

  useEffect(() => {
    requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  
  // --- Arcade Mode Logic ---
  const beginArcadeTimers = useCallback(() => {
    clearInterval(arcadeTimerRef.current);
    clearTimeout(targetTimerRef.current);

    const spawnTarget = () => {
        const canvas = canvasRef.current;
        if (!canvas || !runningRef.current) return;
        const rect = canvas.getBoundingClientRect();
        targetsRef.current.push({
            x: rand(rect.width * 0.1, rect.width * 0.9),
            y: rand(rect.height * 0.1, rect.height * 0.6),
            r: rand(20, 50),
            t: 0,
            life: 2,
        });
        targetTimerRef.current = window.setTimeout(spawnTarget, rand(800, 2000));
    };
    spawnTarget();

    arcadeTimerRef.current = window.setInterval(() => {
        setTimer(t => {
            if (t <= 1) {
                clearInterval(arcadeTimerRef.current);
                clearTimeout(targetTimerRef.current);
                setRunning(false);
                return 0;
            }
            return t - 1;
        });
    }, 1000);
  }, []);

  const startNewArcadeGame = useCallback(() => {
    setScore(0);
    setTimer(60);
    targetsRef.current = [];
    setContinuedGame(false);
    setMegaBombAvailable(true);
    setHasMegaBomb(false);
    rocketsRef.current = [];
    fireworksRef.current = [];
    particlesRef.current = [];
    setRunning(true);
    setTimeout(beginArcadeTimers, 0);
  }, [beginArcadeTimers]);

  const continueArcadeGame = useCallback(() => {
    setTimer(15);
    setContinuedGame(true);
    targetsRef.current = [];
    setRunning(true);
    setTimeout(beginArcadeTimers, 0);
  }, [beginArcadeTimers]);

  useEffect(() => {
      const stopArcadeGame = () => {
          clearInterval(arcadeTimerRef.current);
          clearTimeout(targetTimerRef.current);
          targetsRef.current = [];
          rocketsRef.current = [];
          fireworksRef.current = [];
      };

      if (mode === 'arcade') {
        startNewArcadeGame();
      }
      
      return stopArcadeGame;
  }, [mode, startNewArcadeGame]);

  useEffect(() => {
      if (mode === 'arcade' && timer === 0) {
          clearTimeout(targetTimerRef.current);
          targetsRef.current = [];
          if (score > best) {
              setBest(score);
              localStorage.setItem('fw_best_score', score.toString());
          }
      }
  }, [timer, score, best, mode]);

  // --- Ad Logic ---
  const showRewardedAd = async (
    setState: React.Dispatch<React.SetStateAction<AdStatus>>,
    onSuccess: () => void
  ) => {
    // FIX: Removed unnecessary '@ts-ignore' as 'adjuice' is now globally declared for this file.
    if (typeof adjuice === 'undefined' || typeof adjuice.showAd !== 'function') {
      console.error('AdJuice SDK not ready or showAd is not a function.');
      setState('error');
      setTimeout(() => setState('idle'), 2000);
      return;
    }

    setState('loading');

    try {
      // Race the ad promise against a timeout to prevent button getting stuck
      const adPromise = adjuice.showAd({ placement: 'rewarded' });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Ad request timed out')), 8000) // 8-second timeout
      );

      // @ts-ignore
      const result = await Promise.race([adPromise, timeoutPromise]);

      if (result.success) {
        onSuccess();
        setState('idle');
      } else {
        // Handle cases where the ad SDK returns a failure object
        console.error('Ad failed to show:', result.error || 'Unknown SDK error');
        setState('error');
        setTimeout(() => setState('idle'), 2000);
      }
    } catch (e) {
      // Handle timeout or other exceptions
      console.error('Error showing ad:', e);
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    }
  };


  const handleContinueWithAd = () => {
    // Prevent starting a new ad if one is already loading
    if (continueAdState === 'loading' || megaBombAdState === 'loading') return;
    showRewardedAd(setContinueAdState, continueArcadeGame);
  };
  
  const handleGetMegaBomb = () => {
    // Prevent starting a new ad if one is already loading
    if (continueAdState === 'loading' || megaBombAdState === 'loading') return;
    showRewardedAd(setMegaBombAdState, () => {
      setHasMegaBomb(true);
      setMegaBombAvailable(false);
    });
  };


  // --- Input Handling ---
  const onCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode === 'paint' || mode === 'show') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      pointerDownInfoRef.current = {
        time: performance.now(),
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      
      // Start continuous hold detection
      setIsHolding(true);
      holdIntervalRef.current = window.setInterval(() => {
        const info = pointerDownInfoRef.current;
        if (!info) return;
        
        const duration = performance.now() - info.time;
        const power = clamp(duration / 1000, 0, 1); // 0 to 100% over 1 second
        
        // If power > 0.1 (10%), trigger large explosion audio and rocket
        if (power > 0.1) {
          const audioResult = pop(rand(200, 800), 0.08, power);
          if (audioResult === 'LARGE_EXPLOSION') {
            // Create slow rocket that moves based on power percentage
            const slowVelocity = -15 * (1 - power); // Slower as power increases
            const slowRocket = new Rocket(rect.width, rect.height, PALETTES, { x: info.x, y: info.y }, { vy: slowVelocity, vx: 0 }, true);
            rocketsRef.current.push(slowRocket);
            setLargeExplosionRocket(slowRocket);
          }
        }
      }, 100); // Check every 100ms
    }
  };

  const cancelLargeExplosion = () => {
    if (largeExplosionRocket) {
      // Remove the rocket from the rockets array
      const index = rocketsRef.current.indexOf(largeExplosionRocket);
      if (index > -1) {
        rocketsRef.current.splice(index, 1);
      }
      setLargeExplosionRocket(null);
    }
  };

  const onCanvasPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const targetX = e.clientX - rect.left;
    const targetY = e.clientY - rect.top;

    // Stop hold detection
    setIsHolding(false);
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }


    // Handle Paint and Show modes with charged explosions
    if (mode === 'paint' || mode === 'show') {
        const info = pointerDownInfoRef.current;
        pointerDownInfoRef.current = null; // Reset on pointer up

        let power = 0;
        if (info) {
            const duration = performance.now() - info.time;
            // Calculate power: starts at 0, increments slowly to 1 (100%) over time
            // Each 1ms adds 0.001, so it takes 1000ms (1 second) to reach 100%
            power = clamp(duration / 1000, 0, 1);
        }
        
        // In Show mode, always launch rockets regardless of Auto-Play setting
        if (mode === 'show') {
            rocketsRef.current.push(new Rocket(rect.width, rect.height, PALETTES, { x: targetX, y: targetY }));
            pop(1000, 0.05, 1);
        }
        
        // In Paint mode, create immediate explosion without rockets
        if (mode === 'paint') {
            // Check if this is a single click (power = 0) or a hold (power > 0)
            if (power === 0) {
                // Single click - create rocket trail and immediate explosion
                const selectedType = fireworkType === 'random' ? choice(FIREWORK_TYPES) : fireworkType;
                
                // Create a fast rocket for single clicks (like a water pistol)
                const fastRocket = new Rocket(rect.width, rect.height, PALETTES, { x: targetX, y: targetY }, { vy: -200, vx: 0 }); // Very fast upward movement
                rocketsRef.current.push(fastRocket);
                
                // Also create immediate paint firework
                const paintFirework = new Firework(targetX, targetY, PALETTES[palette], 1, selectedType);
                // Make paint particles last longer and move slower for better paint effect
                paintFirework.particles.forEach(p => {
                    p.life *= 2; // Double the lifetime
                    p.vx *= 0.5; // Half the horizontal speed
                    p.vy *= 0.5; // Half the vertical speed
                    p.size *= 1.2; // Slightly larger particles
                });
                fireworksRef.current.push(paintFirework);
                
                // Play regular firework audio for single clicks
                pop(rand(200, 800), 0.08, 0); // Use power 0 for regular audio
            }
            // For holds (power > 0), the rocket and audio are already handled in the interval
        } else if (mode === 'show') {
            // Check if this is a single click (power = 0) or a hold (power > 0)
            if (power === 0) {
                // Single click - create rocket trail and immediate explosion
                const selectedType = fireworkType === 'random' ? choice(FIREWORK_TYPES) : fireworkType;
                
                // Create a fast rocket for single clicks (like a water pistol)
                const fastRocket = new Rocket(rect.width, rect.height, PALETTES, { x: targetX, y: targetY }, { vy: -200, vx: 0 }); // Very fast upward movement
                rocketsRef.current.push(fastRocket);
                
                // Also create immediate show firework
                fireworksRef.current.push(new Firework(targetX, targetY, PALETTES[palette], 1, selectedType));
                
                // Play regular firework audio for single clicks
                pop(rand(200, 800), 0.08, 0); // Use power 0 for regular audio
            }
            // For holds (power > 0), the rocket and audio are already handled in the interval
        }
    } 
    // Handle Arcade mode (launch rockets)
    else if (mode === 'arcade') {
        // If game is over in arcade, a click starts a new game
        if (!running && timer === 0) {
            startNewArcadeGame();
            return;
        }
        rocketsRef.current.push(new Rocket(rect.width, rect.height, PALETTES, { x: targetX, y: targetY }));
        pop(1000, 0.05);
    }
  };

  const onCanvasPointerLeave = () => {
    // If the user drags off the canvas, cancel the charged shot
    pointerDownInfoRef.current = null;
  };


  // --- Device Tilt ---
  useEffect(() => {
    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const { accelerationIncludingGravity } = event;
      if (accelerationIncludingGravity) {
        const { x, y } = accelerationIncludingGravity;
        if (x !== null && y !== null) {
          const isLandscape = window.innerWidth > window.innerHeight;
          tiltRef.current.gx = isLandscape ? -y : x;
          tiltRef.current.gy = isLandscape ? -x : -y;
        }
      }
    };
    
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleDeviceMotion);
    }
    
    return () => {
      if (window.DeviceMotionEvent) {
        window.removeEventListener('devicemotion', handleDeviceMotion);
      }
    };
  }, []);

  // --- Keyboard Shortcuts & Fullscreen ---
  const togglePlayback = useCallback(() => setRunning(r => !r), []);
  const toggleFullscreen = useCallback(() => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(console.error);
      } else {
        document.exitFullscreen().catch(console.error);
      }
  }, []);
  
  useEffect(() => {
      const onFullscreenChange = () => {
          setIsFullscreen(!!document.fullscreenElement);
      };
      document.addEventListener('fullscreenchange', onFullscreenChange);
      return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'p') togglePlayback();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayback]);

  // --- UI Functions ---
  const handleFinale = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate number of rockets based on duration (more rockets for longer finale)
    const rocketCount = Math.floor(25 * (finaleDuration / 5)); // Scale based on 5s default
    const maxDelay = finaleDuration * 1000; // Convert to milliseconds
    
    for (let i = 0; i < rocketCount; i++) {
      setTimeout(() => {
        rocketsRef.current.push(new Rocket(rect.width, rect.height, PALETTES));
        pop(rand(200, 800), 0.08, 1); // Add audio for finale rockets
      }, rand(0, maxDelay));
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Create a new canvas for the full-screen capture (excluding menu)
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      
      // Set canvas size to full screen
      tempCanvas.width = window.innerWidth;
      tempCanvas.height = window.innerHeight;
      
      // Fill with black background
      tempCtx.fillStyle = '#000000';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Draw the fireworks canvas scaled to full screen
      tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
      
      // Convert to blob for mobile-friendly download
      tempCanvas.toBlob((blob) => {
        if (!blob) return;
        
        // Create object URL
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = `fireworks-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
        
        // For mobile devices, try to trigger download
        if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          // On mobile, open in new tab to allow user to save
          const newWindow = window.open();
          if (newWindow) {
            newWindow.document.write(`
              <html>
                <head><title>Save Fireworks Photo</title></head>
                <body style="margin:0; padding:20px; background:#000; color:#fff; text-align:center;">
                  <h2>🎆 Your Fireworks Photo</h2>
                  <img src="${url}" style="max-width:100%; height:auto; border-radius:10px;" />
                  <p style="margin-top:20px;">Long press the image above and select "Save to Photos" or "Download"</p>
                  <button onclick="window.close()" style="margin-top:20px; padding:10px 20px; background:#4CAF50; color:white; border:none; border-radius:5px; cursor:pointer;">Close</button>
                </body>
              </html>
            `);
          }
        } else {
          // Desktop: direct download
          link.click();
        }
        
        // Clean up object URL after a delay
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, 'image/png', 0.95);
    }
  };

  const handleClear = useCallback(() => {
    rocketsRef.current = [];
    fireworksRef.current = [];
    particlesRef.current = [];
  }, []);

  // --- Render ---
  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col">
      <div className="relative flex-grow touch-none select-none overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 h-full w-full"
          onPointerDown={onCanvasPointerDown}
          onPointerUp={onCanvasPointerUp}
          onPointerLeave={onCanvasPointerLeave}
        />

        <TopBar
          mode={mode} setMode={setMode}
          running={running} onTogglePlayback={togglePlayback}
          soundOn={soundOn} setSoundOn={setSoundOn}
          fireworkSfxOn={fireworkSfxOn} setFireworkSfxOn={setFireworkSfxOn}
          volume={volume} setVolume={setVolume}
          autoShow={autoShow} setAutoShow={setAutoShow}
          gravity={gravity} setGravity={setGravity}
          fireworkType={fireworkType} setFireworkType={setFireworkType}
          finaleDuration={finaleDuration} setFinaleDuration={setFinaleDuration}
          onFinale={handleFinale}
          onClear={handleClear}
          onSave={handleSave}
          onShowTerms={() => setShowTerms(true)}
          score={score} timer={timer} best={best}
          isMenuVisible={isMenuVisible} setIsMenuVisible={setIsMenuVisible}
          isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen}
        />

        {/* Game Over Screen */}
        {mode === 'arcade' && timer === 0 && (
          <div className="absolute inset-0 z-20 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-4xl font-bold mb-2">Game Over</h2>
            <p className="text-xl mb-4">Final Score: <strong className="text-pink-400">{score}</strong></p>
            {score > best && <p className="text-lg text-yellow-400 mb-4 animate-pulse">New High Score!</p>}
            
            <button onClick={startNewArcadeGame} className="text-lg bg-green-500/80 hover:bg-green-500/100 border border-green-300/30 rounded-lg font-semibold transition-colors px-6 py-3 mb-4">
              Play Again
            </button>
            
            {!continuedGame && (
              <div className="flex flex-col items-center">
                 <p className="text-sm opacity-80 mb-2">or watch an ad to continue</p>
                 <button 
                  onClick={handleContinueWithAd}
                  disabled={!isAdSdkReady || continueAdState !== 'idle'}
                  className="text-base bg-blue-500/80 hover:bg-blue-500/100 border border-blue-300/30 rounded-lg font-semibold transition-colors px-6 py-2 disabled:bg-gray-500/50 disabled:cursor-not-allowed"
                 >
                   {continueAdState === 'loading' ? 'Loading Ad...' : continueAdState === 'error' ? 'Ad Error, try again' : 'Continue (+15s)'}
                 </button>
              </div>
            )}
          </div>
        )}

      </div>
      <div className="w-full h-[90px] shrink-0 bg-black flex items-center justify-center">
        <Ad />
      </div>

      {/* Terms Page Modal */}
      {showTerms && (
        <TermsPage onClose={() => setShowTerms(false)} />
      )}
    </div>
  );
};

export default FireworksArcade;