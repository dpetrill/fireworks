import React from 'react';
import type { Mode } from '../types';
import { PALETTES } from '../constants';

interface TopBarProps {
  mode: Mode;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  running: boolean;
  onTogglePlayback: () => void;
  soundOn: boolean;
  setSoundOn: React.Dispatch<React.SetStateAction<boolean>>;
  fireworkSfxOn: boolean;
  setFireworkSfxOn: React.Dispatch<React.SetStateAction<boolean>>;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  autoShow: boolean;
  setAutoShow: React.Dispatch<React.SetStateAction<boolean>>;
  gravity: number;
  setGravity: React.Dispatch<React.SetStateAction<number>>;
  palette: number;
  setPalette: React.Dispatch<React.SetStateAction<number>>;
  onFinale: () => void;
  onClear: () => void;
  onSave: () => void;
  score: number;
  timer: number;
  best: number;
  isMenuVisible: boolean;
  setIsMenuVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  mode, setMode, running, onTogglePlayback, soundOn, setSoundOn, 
  fireworkSfxOn, setFireworkSfxOn, volume, setVolume,
  autoShow, setAutoShow, gravity, setGravity, palette, setPalette, onFinale,
  onClear, onSave, 
  score, timer, best, isMenuVisible, setIsMenuVisible, isFullscreen, onToggleFullscreen
}) => {

  return (
    <div className="absolute z-10 top-2 left-1/2 -translate-x-1/2 w-[96%] max-w-5xl">
      <div className="backdrop-blur bg-white/10 border border-white/20 rounded-2xl shadow-xl p-3 md:p-4 flex flex-col md:flex-row gap-0 md:gap-4 items-center justify-between">
        <div className="flex w-full md:w-auto items-center justify-between md:justify-start flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <h1 className="text-lg md:text-2xl font-bold tracking-wide">🎆</h1>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-2xl font-bold tracking-wide">Fireworks Arcade</h1>
              <span className="text-[10px] md:text-xs opacity-70 -mt-1">Show • Paint • Arcade</span>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={onToggleFullscreen}
              className="text-xl p-2 rounded-full hover:bg-white/20 transition-colors"
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? '↙️' : '↗️'}
            </button>
            <button
              onClick={() => setIsMenuVisible(v => !v)}
              className="text-xl p-2 rounded-full hover:bg-white/20 transition-colors"
              aria-label={isMenuVisible ? 'Hide controls menu' : 'Show controls menu'}
            >
              {isMenuVisible ? '🔼' : '⚙️'}
            </button>
          </div>
        </div>

        <div className={`
          w-full md:w-auto overflow-hidden transition-all duration-300 ease-in-out 
          ${isMenuVisible ? 'max-h-[28rem] mt-4 md:mt-0' : 'max-h-0 mt-0'} 
        `}>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <select value={mode} onChange={(e) => setMode(e.target.value as Mode)} className="bg-black/50 border border-white/20 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400">
              <option value="show">Show</option>
              <option value="paint">Paint</option>
              <option value="arcade">Arcade</option>
            </select>

            {mode === 'arcade' && (
              <div className="flex items-center gap-2 text-xs md:text-sm bg-white/5 rounded-lg px-2 py-1.5">
                <span>Score: <b>{score}</b></span>
                <span className="opacity-50">|</span>
                <span>Time: <b>{timer}s</b></span>
                <span className="opacity-50">|</span>
                <span>Best: <b>{best}</b></span>
              </div>
            )}

            <button onClick={onTogglePlayback} className="px-3 py-1 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-300/30 text-sm">{running ? 'Pause' : 'Resume'}</button>
            <button onClick={onFinale} className="px-3 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-300/30 text-sm">Finale</button>
            <button onClick={onClear} className="px-3 py-1 rounded-lg bg-gray-500/20 hover:bg-gray-500/30 border border-gray-300/30 text-sm">Clear</button>
            <button onClick={onSave} className="px-3 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-300/30 text-sm">Save Photo</button>

            <div className="flex items-center gap-2 bg-white/10 p-1 rounded-lg">
                <button onClick={() => {
                  console.log('Mute button clicked, current soundOn:', soundOn);
                  setSoundOn(s => {
                    console.log('Setting soundOn to:', !s);
                    return !s;
                  });
                  // Also toggle global audio manager
                  if (typeof window !== 'undefined' && (window as any).AudioManager) {
                    (window as any).AudioManager.toggleMute();
                  }
                }} className="text-lg w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/20 transition-colors" aria-label={soundOn ? "Mute All" : "Unmute All"}>
                    {soundOn ? '🔊' : '🔇'}
                </button>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={volume} 
                    onChange={(e) => setVolume(parseFloat(e.target.value))} 
                    className="w-20 accent-pink-400 disabled:opacity-50"
                    disabled={!soundOn}
                    aria-label="Master Volume"
                />
                <span className="text-xs text-white/70 min-w-[2rem] text-center">
                  {Math.round(volume * 100)}%
                </span>
                 <div className="w-px h-5 bg-white/20 mx-1"></div>
                <button 
                  onClick={() => setFireworkSfxOn(s => !s)} 
                  className="text-lg w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/20 transition-colors disabled:opacity-50"
                  disabled={!soundOn}
                  aria-label={fireworkSfxOn ? "Mute Fireworks" : "Unmute Fireworks"}
                >
                    {fireworkSfxOn ? '💥' : '💨'}
                </button>
            </div>

            {(mode === 'show' || mode === 'paint') && <label className="flex items-center gap-1.5 text-xs md:text-sm cursor-pointer">
              <input type="checkbox" checked={autoShow} onChange={(e) => setAutoShow(e.target.checked)} className="accent-pink-400"/> Auto Play
            </label>}

            <div className="flex items-center gap-1 text-xs md:text-sm">
              <span className="opacity-80">Gravity</span>
              <input type="range" min="0" max="0.12" step="0.005" value={gravity} onChange={(e) => setGravity(parseFloat(e.target.value))} className="w-20 accent-pink-400"/>
            </div>

            <div className="flex items-center gap-1 text-xs md:text-sm">
              <span className="opacity-80">Palette</span>
              <select value={palette} onChange={(e) => setPalette(Number(e.target.value))} className="bg-black/50 border border-white/20 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400">
                {PALETTES.map((p, i) => (
                  <option key={i} value={i}>#{i + 1}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TopBar;