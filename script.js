/**
 * Arcade X - Vanilla JS Logic with Data Saving
 */

let baseGames = [];
let allGames = [];
let categories = ['All'];
let selectedCategory = 'All';
let searchQuery = '';

// Persistent Data Structure
let localData = {
  favorites: [],
  recent: [],
};

// DOM Elements
const gameGrid = document.getElementById('game-grid');
const categoryList = document.getElementById('category-list');
const featuredGameEl = document.getElementById('featured-game');
const searchInput = document.getElementById('game-search');
const matchCountEl = document.getElementById('match-count');
const currentCategoryEl = document.getElementById('current-category');
const gridSection = document.querySelector('.grid-section');
const updatesSection = document.getElementById('updates-section');
const updatesList = document.getElementById('updates-list');
const aiSection = document.getElementById('ai-section');
const searchSection = document.getElementById('search-section');
const settingsSection = document.getElementById('settings-section');
const creditsSection = document.getElementById('credits-section');

const aiChatBox = document.getElementById('ai-chat-box');
const aiInput = document.getElementById('ai-input');
const aiSendBtn = document.getElementById('ai-send-btn');

const webSearchInput = document.getElementById('web-search-input');
const searchBtn = document.getElementById('web-search-btn');
const searchIframe = document.getElementById('search-iframe');
const searchPlaceholder = document.getElementById('search-placeholder');

const playerOverlay = document.getElementById('player-overlay');
const gameIframe = document.getElementById('game-iframe');
const closePlayerBtn = document.getElementById('close-player');
const activeGameTitle = document.getElementById('active-game-title');
const activeGameCategory = document.getElementById('active-game-category');
const toggleFsBtn = document.getElementById('toggle-fs');
const panicBtn = document.getElementById('panic-btn');

// Initialize
async function init() {
  const savedAccent = localStorage.getItem('arcade-accent');
  if (savedAccent) {
    document.documentElement.style.setProperty('--accent-glow', savedAccent);
  }
  const savedPanic = localStorage.getItem('arcade-panic-url');
  if (savedPanic) {
    panicUrl = savedPanic;
  }
  loadLocalData();
  setupPanic();
  try {
    const response = await fetch('./src/data/games.json');
    const data = await response.json();
    baseGames = data.games;
    refreshAllGames();
    updateCategories();
    
    renderCategories();
    renderGames();
    setupFeaturedGame();
    lucide.createIcons();
    setupEventListeners();
    initOnlineCounter();
  } catch (error) {
    console.error('Error loading games:', error);
    refreshAllGames();
    updateCategories();
    renderCategories();
    renderGames();
    lucide.createIcons();
    setupEventListeners();
  }
}

function loadLocalData() {
  const saved = localStorage.getItem('arcade-x-data');
  if (saved) {
    try {
      localData = { ...localData, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Error parsing local storage:', e);
    }
  }
}

function saveLocalData() {
  localStorage.setItem('arcade-x-data', JSON.stringify(localData));
}

function refreshAllGames() {
  allGames = [...baseGames];
}

function updateCategories() {
  const cats = new Set(allGames.map(g => g.category));
  categories = ['All', ...Array.from(cats)];
}

function setupEventListeners() {
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderGames();
  });

  closePlayerBtn.addEventListener('click', closePlayer);
  
  toggleFsBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      gameIframe.requestFullscreen().catch(err => {
        alert(`Fullscreen error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  });

  document.querySelectorAll('.nav-item[data-category]').forEach(item => {
    item.addEventListener('click', () => {
      selectedCategory = item.getAttribute('data-category');
      updateActiveCategory();
      renderGames();
    });
  });
}

function updateActiveCategory() {
  document.querySelectorAll('.nav-item[data-category]').forEach(item => {
    if (item.getAttribute('data-category') === selectedCategory) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  if (selectedCategory === 'Updates') {
    gridSection.classList.add('hidden');
    document.getElementById('featured-section').classList.add('hidden');
    updatesSection.classList.remove('hidden');
    aiSection.classList.add('hidden');
    searchSection.classList.add('hidden');
    renderUpdates();
  } else if (selectedCategory === 'AI') {
    gridSection.classList.add('hidden');
    document.getElementById('featured-section').classList.add('hidden');
    updatesSection.classList.add('hidden');
    aiSection.classList.remove('hidden');
    searchSection.classList.add('hidden');
    setupAI();
  } else if (selectedCategory === 'Search') {
    gridSection.classList.add('hidden');
    document.getElementById('featured-section').classList.add('hidden');
    updatesSection.classList.add('hidden');
    aiSection.classList.add('hidden');
    searchSection.classList.remove('hidden');
    setupSearch();
  } else if (selectedCategory === 'Settings') {
    gridSection.classList.add('hidden');
    document.getElementById('featured-section').classList.add('hidden');
    updatesSection.classList.add('hidden');
    aiSection.classList.add('hidden');
    searchSection.classList.add('hidden');
    settingsSection.classList.remove('hidden');
    creditsSection.classList.add('hidden');
    setupSettings();
  } else if (selectedCategory === 'Credits') {
    gridSection.classList.add('hidden');
    document.getElementById('featured-section').classList.add('hidden');
    updatesSection.classList.add('hidden');
    aiSection.classList.add('hidden');
    searchSection.classList.add('hidden');
    settingsSection.classList.add('hidden');
    creditsSection.classList.remove('hidden');
  } else {
    gridSection.classList.remove('hidden');
    document.getElementById('featured-section').classList.remove('hidden');
    updatesSection.classList.add('hidden');
    aiSection.classList.add('hidden');
    searchSection.classList.add('hidden');
    settingsSection.classList.add('hidden');
    creditsSection.classList.add('hidden');
    currentCategoryEl.textContent = selectedCategory === 'All' ? 'Current Library' : selectedCategory;
  }
}

let settingsInitialized = false;
function setupSettings() {
  if (settingsInitialized) return;
  
  const atmosphereToggle = document.getElementById('setting-atmosphere');
  const accentSelect = document.getElementById('setting-accent');
  const panicInput = document.getElementById('setting-panic-url');
  const clearDataBtn = document.getElementById('clear-data-btn');

  // Load existing settings
  const savedAccent = localStorage.getItem('arcade-accent');
  if (savedAccent) {
    accentSelect.value = savedAccent;
    document.documentElement.style.setProperty('--accent-glow', savedAccent);
  }

  const savedPanic = localStorage.getItem('arcade-panic-url');
  if (savedPanic) {
    panicInput.value = savedPanic;
  }

  atmosphereToggle.addEventListener('change', (e) => {
    document.body.querySelector('.atmosphere').style.display = e.target.checked ? 'block' : 'none';
  });

  accentSelect.addEventListener('change', (e) => {
    const color = e.target.value;
    document.documentElement.style.setProperty('--accent-glow', color);
    localStorage.setItem('arcade-accent', color);
  });

  panicInput.addEventListener('input', (e) => {
    panicUrl = e.target.value || 'https://google.com';
    localStorage.setItem('arcade-panic-url', panicUrl);
  });

  clearDataBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all local data? This will reset your favorites and settings.')) {
      localStorage.clear();
      window.location.reload();
    }
  });

  settingsInitialized = true;
}

let searchInitialized = false;
function setupSearch() {
  if (searchInitialized) return;
  
  searchBtn.addEventListener('click', handleWebSearch);
  webSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleWebSearch();
  });
  
  searchInitialized = true;
}

function handleWebSearch() {
  const query = webSearchInput.value.trim();
  if (!query) return;
  
  searchPlaceholder.classList.add('hidden');
  // Using Google's internal embedding mode which is often unblocked
  const searchUrl = `https://www.google.com/search?igu=1&q=${encodeURIComponent(query)}`;
  searchIframe.src = searchUrl;
}

let aiInitialized = false;

let panicUrl = 'https://google.com';

function setupPanic() {
  panicBtn.addEventListener('click', () => {
    window.open(panicUrl, '_blank');
  });

  // Global escape key for panic
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.open(panicUrl, '_blank');
    }
  });
}

function setupAI() {
  if (aiInitialized) return;
  
  aiSendBtn.addEventListener('click', handleAISend);
  aiInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAISend();
  });
  
  aiInitialized = true;
}

async function handleAISend() {
  const prompt = aiInput.value.trim();
  if (!prompt) return;
  
  // Add user message
  addChatMessage('user', prompt);
  aiInput.value = '';
  
  // Typing indicator
  const typingId = 'typing-' + Date.now();
  const typingMsg = document.createElement('div');
  typingMsg.className = 'ai-message system';
  typingMsg.id = typingId;
  typingMsg.innerHTML = `<div class="ai-msg-content ai-typing">Arcade X AI is thinking...</div>`;
  aiChatBox.appendChild(typingMsg);
  aiChatBox.scrollTop = aiChatBox.scrollHeight;

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // System context
    const sysPrompt = `You are a helpful AI assistant. Provide direct, accurate answers to the user's questions. 
    Do NOT mention or reference any specific games on this site. Keep responses concise and friendly.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: sysPrompt
      }
    });

    // Remove typing
    document.getElementById(typingId).remove();
    
    addChatMessage('system', response.text || "I'm sorry, I couldn't process that request.");
  } catch (error) {
    console.error('AI Error:', error);
    document.getElementById(typingId).remove();
    addChatMessage('system', "Error: I'm having trouble connecting to the neural network. Please check your configuration.");
  }
}

function addChatMessage(role, text) {
  const msg = document.createElement('div');
  msg.className = `ai-message ${role}`;
  msg.innerHTML = `<div class="ai-msg-content">${text}</div>`;
  aiChatBox.appendChild(msg);
  aiChatBox.scrollTop = aiChatBox.scrollHeight;
}

function renderUpdates() {
  const updates = [
    {
      title: 'Double Trouble: Escape Road 1 & 2 are Live!',
      date: 'April 18, 2026',
      tag: 'New Games',
      content: 'We’ve added both the original Escape Road and its high-octane sequel. Choose your ride and start the chase!'
    },
    {
      title: 'Emergency Override: Panic Button Added!',
      date: 'April 18, 2026',
      tag: 'New Feature',
      content: 'Added a stealthy "Panic Button" to the header. Configure your safe URL in settings and press "Esc" for an instant escape to a new tab.'
    },
    {
      title: 'Control Center Active: Settings Tab Launched!',
      date: 'April 18, 2026',
      tag: 'New Feature',
      content: 'Personalize your Arcade X experience. You can now toggle atmosphere effects, change your accent color, and manage local data in the new Settings tab.'
    },
    {
      title: 'Global Search Unleashed: Unblocked Web Search!',
      date: 'April 18, 2026',
      tag: 'New Feature',
      content: 'We’ve integrated a privacy-focused, unblocked search engine directly into the dashboard. Search the web anonymously without leaving Arcade X.'
    },
    {
      title: 'Drifting Legends: Drift Boss Added!',
      date: 'April 18, 2026',
      tag: 'New Game',
      content: 'Master the art of the drift. Drift Boss is now unblocked and ready to play. Challenge yourself on the winding infinite track.'
    },
    {
      title: 'Retro Revival: Pokémon Emerald!',
      date: 'April 18, 2026',
      tag: 'New Game',
      content: 'Journey back to Hoenn. Pokémon Emerald is now playable in Arcade X with full save state support and GBA emulation.'
    },
    {
      title: 'New Gameplay: Minecraft added!',
      date: 'April 18, 2026',
      tag: 'New Game',
      content: 'Experience the magic of Minecraft (EaglercraftX) directly in Arcade X. We\'ve optimized the loader for smoother performance on all devices.'
    },
    {
      title: 'Competitive Mode: 1v1.lol Joins',
      date: 'April 18, 2026',
      tag: 'New Game',
      content: 'The ultimate build-and-shoot battle royale is now unblocked. Practive your builds and dominates the arena.'
    },
    {
      title: 'Branding Refresh & Performance',
      date: 'April 17, 2026',
      tag: 'System',
      content: 'Updated our core engine (Arcade X v2.4.0) with faster game loading and a brand new glowing gamepad logo.'
    },
    {
      title: 'The Classics: Geometry Dash',
      date: 'April 17, 2026',
      tag: 'New Game',
      content: 'Rhythm action is back. We\'ve added Geometry Dash with full unblocked support for chromebooks.'
    }
  ];

  updatesList.innerHTML = '';
  updates.forEach(u => {
    const item = document.createElement('div');
    item.className = 'update-item';
    item.innerHTML = `
      <div class="update-header">
        <span class="update-tag">${u.tag}</span>
        <span class="update-date">${u.date}</span>
      </div>
      <div class="update-content">
        <h3>${u.title}</h3>
        <p>${u.content}</p>
      </div>
    `;
    updatesList.appendChild(item);
  });
}

function renderCategories() {
  categoryList.innerHTML = '';
  categories.slice(1).forEach(cat => {
    const item = document.createElement('div');
    item.className = 'nav-item';
    if (cat === selectedCategory) item.classList.add('active');
    item.setAttribute('data-category', cat);
    item.innerHTML = `<span>${cat}</span>`;
    item.addEventListener('click', () => {
      selectedCategory = cat;
      updateActiveCategory();
      renderGames();
    });
    categoryList.appendChild(item);
  });
}

function setupFeaturedGame() {
  const slope = allGames.find(g => g.id === 'slope') || allGames[0];
  if (!slope) return;
  
  const title = document.getElementById('featured-title');
  const desc = document.getElementById('featured-desc');
  title.textContent = slope.title;
  desc.textContent = slope.description;
  
  // Set background image from game thumbnail
  featuredGameEl.style.setProperty('--featured-bg', `url(${slope.thumbnail})`);
  
  featuredGameEl.addEventListener('click', () => openPlayer(slope));
}

function renderGames() {
  let displayGames = allGames;

  if (selectedCategory === 'Favorites') {
    displayGames = allGames.filter(g => localData.favorites.includes(g.id));
  } else if (selectedCategory === 'Recent') {
    displayGames = (localData.recent || [])
      .map(id => allGames.find(g => g.id === id))
      .filter(g => g !== undefined);
  } else {
    displayGames = allGames.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery) || 
                          game.description.toLowerCase().includes(searchQuery);
      const matchesCategory = selectedCategory === 'All' || game.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  gameGrid.innerHTML = '';
  matchCountEl.textContent = `${displayGames.length} matches`;

  displayGames.forEach(game => {
    const isFav = localData.favorites.includes(game.id);
    const card = document.createElement('div');
    card.className = 'game-card';
    card.style.position = 'relative';
    card.innerHTML = `
      <button class="favorite-btn ${isFav ? 'active' : ''}" data-id="${game.id}">
        <i data-lucide="heart" class="${isFav ? 'fill-current' : ''}"></i>
      </button>
      <div class="game-thumb">
        <img src="${game.thumbnail}" alt="${game.title}" referrerpolicy="no-referrer">
        <div class="play-tip">
          <div class="tip-circle">
            <i data-lucide="play"></i>
          </div>
        </div>
      </div>
      <div class="game-info">
        <h3>${game.title}</h3>
        <div class="game-meta">
          <span class="game-category">${game.category}</span>
          <div class="game-plays">
            <span class="dot"></span>
            ${Math.floor(Math.random() * 500) + 100} Plays
          </div>
        </div>
      </div>
    `;
    
    card.addEventListener('click', (e) => {
      if (e.target.closest('.favorite-btn')) {
        toggleFavorite(game.id);
        return;
      }
      openPlayer(game);
    });
    gameGrid.appendChild(card);
  });
  
  lucide.createIcons();
}

function toggleFavorite(id) {
  const index = localData.favorites.indexOf(id);
  if (index === -1) {
    localData.favorites.push(id);
  } else {
    localData.favorites.splice(index, 1);
  }
  saveLocalData();
  renderGames();
}

function openPlayer(game) {
  activeGameTitle.textContent = game.title;
  activeGameCategory.textContent = game.category;
  gameIframe.src = game.url;
  playerOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Track Recent
  if (!localData.recent) localData.recent = [];
  localData.recent = [game.id, ...localData.recent.filter(id => id !== game.id)].slice(0, 10);
  saveLocalData();

  lucide.createIcons();
}

function closePlayer() {
  playerOverlay.classList.add('hidden');
  gameIframe.src = '';
  document.body.style.overflow = '';
}

/**
 * Dynamic Online Counter
 * Fluctuates numbers to give a live atmospheric feel
 */
function initOnlineCounter() {
  const headerCountEl = document.getElementById('header-online-count');
  const trendingCountEl = document.getElementById('trending-online-count');
  
  if (!headerCountEl || !trendingCountEl) return;

  let headerCount = 842;
  let trendingCount = 4210;

  function updateDisplay() {
    headerCountEl.textContent = `${headerCount.toLocaleString()} Online`;
    trendingCountEl.textContent = trendingCount.toLocaleString();
  }

  function fluctuate() {
    // Random fluctuation between -3 and +3
    headerCount += Math.floor(Math.random() * 7) - 3;
    trendingCount += Math.floor(Math.random() * 11) - 5;
    
    // Bounds to keep it realistic
    if (headerCount < 750) headerCount += 5;
    if (headerCount > 1100) headerCount -= 5;
    if (trendingCount < 3800) trendingCount += 10;
    if (trendingCount > 5500) trendingCount -= 10;
    
    updateDisplay();
    
    // Schedule next fluctuation with a random delay (2-5s)
    setTimeout(fluctuate, Math.random() * 3000 + 2000);
  }

  // Initial update
  updateDisplay();
  fluctuate();
}

init();
