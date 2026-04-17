import { motion } from "motion/react";
import { Play } from "lucide-react";

export default function GameCard({ game, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -4, borderColor: 'rgba(0, 242, 255, 0.4)' }}
      className="group flex flex-col gap-3 p-3 rounded-2xl bg-arc-surface border border-arc-glass transition-all cursor-pointer aspect-[1/1.2]"
      onClick={onClick}
    >
      <div className="flex-1 bg-black/40 rounded-xl overflow-hidden relative group-hover:bg-black/20 transition-colors">
        <img
          src={game.thumbnail}
          alt={game.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Play className="w-4 h-4 text-arc-accent fill-current" />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-1 px-1 pb-1">
        <h3 className="font-semibold text-sm group-hover:text-arc-accent transition-colors truncate">
          {game.title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-arc-dim font-medium">
            {game.category}
          </span>
          <div className="flex items-center gap-1.5 text-[10px] text-arc-dim">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            {Math.floor(Math.random() * 500) + 100} Plays
          </div>
        </div>
      </div>
    </motion.div>
  );
}
