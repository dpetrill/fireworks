import React, { useState, useEffect } from 'react';

interface MusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadUrl: (url: string) => void;
  error: string | null;
  clearError: () => void;
}

const MusicModal: React.FC<MusicModalProps> = ({ isOpen, onClose, onLoadUrl, error, clearError }) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    // Reset local state when modal is closed
    if (!isOpen) {
      setUrl('');
    }
  }, [isOpen]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (error) {
      clearError();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onLoadUrl(url.trim());
    }
  };
  
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-gray-800/80 border border-white/20 rounded-2xl shadow-xl p-6 w-[90%] max-w-md m-4 text-white"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Load Music</h2>
          <button 
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >&times;</button>
        </div>

        <div className="text-sm text-gray-300 mb-4">
            <p>Paste a <strong className="text-pink-400">direct link</strong> to an audio file (e.g., ending in .mp3, .wav, .ogg).</p>
            <p className="text-xs opacity-70 mt-1">Note: Links to music service pages (like SoundCloud, Audio.com) will likely fail due to browser security policies (CORS).</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://.../mysong.mp3"
            className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400"
            aria-label="Audio URL"
          />
          {error && (
            <p className="text-red-400 text-sm mt-2" role="alert">{error}</p>
          )}
          <button
            type="submit"
            className="w-full mt-4 px-4 py-2 bg-pink-500/80 hover:bg-pink-500/100 border border-pink-300/30 rounded-lg font-semibold transition-colors"
          >
            Load
          </button>
        </form>
      </div>
    </div>
  );
};

export default MusicModal;
