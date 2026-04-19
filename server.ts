import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATS_FILE = path.join(__dirname, "stats.json");

// Persistent stats handling
function loadStats() {
  if (fs.existsSync(STATS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATS_FILE, "utf-8"));
    } catch (e) {
      console.error("Error loading stats:", e);
    }
  }
  return { totalVisits: 0, gamePlays: {} };
}

function saveStats(stats: any) {
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
  } catch (e) {
    console.error("Error saving stats:", e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  const stats = loadStats();

  // Simple in-memory user tracking
  const activeUsers = new Map<string, number>();
  const SESSION_TIMEOUT = 45000; // 45 seconds

  // Initialize play tracking from saved stats
  const gamePlays = new Map<string, number>(Object.entries(stats.gamePlays || {}));

  app.use(express.json());

  // API Routes
  app.post("/api/heartbeat", (req, res) => {
    const { sessionId } = req.body;
    if (sessionId) {
      if (!activeUsers.has(sessionId)) {
        // New visitor for this server session
        stats.totalVisits++;
        saveStats(stats);
      }
      activeUsers.set(sessionId, Date.now());
    }
    res.json({ success: true });
  });

  app.get("/api/stats", (req, res) => {
    res.json({
      totalVisits: stats.totalVisits,
      onlineCount: activeUsers.size
    });
  });

  app.get("/api/online-count", (req, res) => {
    const now = Date.now();
    // Cleanup stale sessions
    for (const [id, lastSeen] of activeUsers.entries()) {
      if (now - lastSeen > SESSION_TIMEOUT) {
        activeUsers.delete(id);
      }
    }
    
    // Return count.
    const count = activeUsers.size;
    res.json({ count });
  });

  app.post("/api/games/record-play", (req, res) => {
    const { gameId } = req.body;
    if (gameId) {
      const current = gamePlays.get(gameId) || 0;
      gamePlays.set(gameId, current + 1);
      
      // Update persistent stats
      stats.gamePlays = Object.fromEntries(gamePlays);
      saveStats(stats);
    }
    res.json({ success: true, count: gamePlays.get(gameId) });
  });

  app.get("/api/games/plays", (req, res) => {
    const counts: Record<string, number> = {};
    for (const [id, count] of gamePlays.entries()) {
      counts[id] = count;
    }
    res.json(counts);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
