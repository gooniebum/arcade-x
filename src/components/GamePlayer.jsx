import { motion } from "motion/react";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function GamePlayer({ game, onClose }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    const iframe = document.getElementById('game-iframe');
    if (!iframe) return;

    if (!isFullscreen) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
    >
      <div className="flex items-center justify-between p-4 bg-arc-surface border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div>
            <h2 className="font-display text-xl text-arc-accent uppercase tracking-wider">{game.title}</h2>
            <p className="text-xs text-arc-dim">{game.category}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10 text-sm text-white"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-black flex items-center justify-center">
        <iframe
          id="game-iframe"
          src={game.url}
          className="w-full h-full border-0"
          title={game.title}
          allow="autoplay; fullscreen; pointer-lock"
          referrerPolicy="no-referrer"
        />
      </div>
    </motion.div>
  );
}
