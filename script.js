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

const playerOverlay = document.getElementById('player-overlay');
const gameIframe = document.getElementById('game-iframe');
const closePlayerBtn = document.getElementById('close-player');
const activeGameTitle = document.getElementById('active-game-title');
const activeGameCategory = document.getElementById('active-game-category');
const toggleFsBtn = document.getElementById('toggle-fs');

// Initialize
async function init() {
  loadLocalData();
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
    
    // Link version card to updates
    document.querySelector('.version-card p').addEventListener('click', () => {
      selectedCategory = 'Updates';
      updateActiveCategory();
      renderGames();
    });
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
    renderUpdates();
  } else {
    gridSection.classList.remove('hidden');
    document.getElementById('featured-section').classList.remove('hidden');
    updatesSection.classList.add('hidden');
    currentCategoryEl.textContent = selectedCategory === 'All' ? 'Current Library' : selectedCategory;
  }
}

function renderUpdates() {
  const updates = [
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
