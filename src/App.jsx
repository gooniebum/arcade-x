import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Gamepad2, TrendingUp, Sparkles, Filter, Info, Github } from "lucide-react";
import rawGamesData from "./data/games.json";
import GameCard from "./components/GameCard";
import GamePlayer from "./components/GamePlayer";

const gamesData = rawGamesData;

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeGame, setActiveGame] = useState(null);

  const categories = useMemo(() => {
    const cats = new Set(gamesData.games.map(g => g.category));
    return ["All", ...Array.from(cats)];
  }, []);

  const filteredGames = useMemo(() => {
    return gamesData.games.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || game.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const featuredGame = gamesData.games[2]; // Using "Slope" as featured

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="atmosphere" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[rgba(10,10,15,0.8)] backdrop-blur-2xl border-b border-arc-glass px-10 h-[70px] flex items-center shrink-0">
        <div className="w-full flex items-center justify-between gap-10">
          <div className="flex items-center gap-3 group cursor-pointer text-white">
            <h1 className="font-extrabold text-2xl tracking-widest uppercase bg-gradient-to-r from-arc-accent to-white bg-clip-text text-transparent">
              Arcade X
            </h1>
          </div>

          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-arc-dim" />
            <input
              type="text"
              placeholder="Search unblocked games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-arc-surface border border-arc-glass rounded-full py-2 pl-12 pr-4 focus:outline-none focus:border-arc-accent transition-all placeholder:text-arc-dim text-sm text-white"
            />
          </div>

          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
               <span className="text-xs text-arc-dim font-medium">842 Online</span>
               <div className="w-8 h-8 rounded-full bg-arc-accent flex items-center justify-center relative shadow-[0_0_15px_rgba(0,242,255,0.4)]">
                  <div className="w-full h-full rounded-full bg-arc-accent animate-ping absolute opacity-20" />
               </div>
             </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-70px)]">
        {/* Sidebar */}
        <aside className="w-64 p-10 flex flex-col gap-10 overflow-y-auto no-scrollbar shrink-0 border-r border-arc-glass bg-black/5">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-arc-dim font-bold mb-4">Library</div>
            <div className="flex flex-col gap-1 text-white">
              <button 
                onClick={() => setSelectedCategory("All")}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedCategory === "All" ? "nav-item-active" : "text-arc-dim hover:text-white"}`}
              >
                <TrendingUp className="w-4 h-4" />
                All Games
              </button>
              <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-arc-dim hover:text-white transition-all">
                <Sparkles className="w-4 h-4" />
                Popular Now
              </button>
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-arc-dim font-bold mb-4">Categories</div>
            <div className="flex flex-col gap-1 text-white">
              {categories.slice(1).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${selectedCategory === cat ? "nav-item-active" : "text-arc-dim hover:text-white"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <div className="p-4 rounded-xl glass-panel relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-white">
                <Info className="w-12 h-12" />
              </div>
              <p className="text-[10px] text-arc-dim underline mb-2 cursor-pointer">Community Discord</p>
              <p className="text-[10px] text-arc-dim">Nexus Core v2.4.0</p>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-10 no-scrollbar">
          <div className="flex flex-col gap-10 max-w-6xl">
            {/* Featured Slot */}
            {selectedCategory === "All" && !searchQuery && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-[260px] glass-panel rounded-3xl relative overflow-hidden group cursor-pointer shadow-2xl"
                onClick={() => setActiveGame(featuredGame)}
              >
                <img 
                  src={featuredGame.thumbnail} 
                  className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-1000"
                  alt="Featured"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050508] via-[#050508]/60 to-transparent flex flex-col justify-center p-10 text-white">
                  <span className="bg-arc-hot text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded w-fit mb-4">
                    Featured Game
                  </span>
                  <h2 className="text-4xl font-extrabold mb-2 text-white">
                    {featuredGame.title}
                  </h2>
                  <p className="text-arc-dim text-sm max-w-md line-clamp-2">
                    {featuredGame.description}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Grid */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between text-white">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Filter className="w-5 h-5 text-arc-dim" />
                  {selectedCategory === "All" ? "Current Library" : selectedCategory}
                </h2>
                <span className="text-xs text-arc-dim font-medium">{filteredGames.length} matches</span>
              </div>

              {filteredGames.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-10 text-white">
                  <AnimatePresence mode="popLayout">
                    {filteredGames.map((game) => (
                      <GameCard 
                        key={game.id} 
                        game={game} 
                        onClick={() => setActiveGame(game)} 
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-arc-surface rounded-3xl border border-dashed border-arc-glass">
                  <Gamepad2 className="w-12 h-12 text-arc-dim mb-4 opacity-20" />
                  <p className="text-arc-dim font-medium">No games match your search</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Game Player Modal */}
      <AnimatePresence>
        {activeGame && (
          <GamePlayer 
            game={activeGame} 
            onClose={() => setActiveGame(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
