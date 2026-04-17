/**
 * Arcade X - Vanilla JS Logic
 */

let allGames = [];
let categories = ['All'];
let selectedCategory = 'All';
let searchQuery = '';

// DOM Elements
const gameGrid = document.getElementById('game-grid');
const categoryList = document.getElementById('category-list');
const featuredGameEl = document.getElementById('featured-game');
const searchInput = document.getElementById('game-search');
const matchCountEl = document.getElementById('match-count');
const currentCategoryEl = document.getElementById('current-category');

const playerOverlay = document.getElementById('player-overlay');
const gameIframe = document.getElementById('game-iframe');
const closePlayerBtn = document.getElementById('close-player');
const activeGameTitle = document.getElementById('active-game-title');
const activeGameCategory = document.getElementById('active-game-category');
const toggleFsBtn = document.getElementById('toggle-fs');

// Initialize
async function init() {
  try {
    const response = await fetch('./src/data/games.json');
    const data = await response.json();
    allGames = data.games;
    
    // Extract categories
    const cats = new Set(allGames.map(g => g.category));
    categories = ['All', ...Array.from(cats)];
    
    renderCategories();
    renderGames();
    setupFeaturedGame();
    lucide.createIcons();
    setupEventListeners();
  } catch (error) {
    console.error('Error loading games:', error);
  }
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
        alert(`Error escaping to full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  });

  // Category clicks
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const cat = item.getAttribute('data-category');
      if (cat) {
        selectedCategory = cat;
        updateActiveCategory();
        renderGames();
      }
    });
  });
}

function updateActiveCategory() {
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('data-category') === selectedCategory) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  currentCategoryEl.textContent = selectedCategory === 'All' ? 'Current Library' : selectedCategory;
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
  const filtered = allGames.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery) || 
                        game.description.toLowerCase().includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  gameGrid.innerHTML = '';
  matchCountEl.textContent = `${filtered.length} matches`;

  filtered.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
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
    
    card.addEventListener('click', () => openPlayer(game));
    gameGrid.appendChild(card);
  });
  
  lucide.createIcons();
}

function openPlayer(game) {
  activeGameTitle.textContent = game.title;
  activeGameCategory.textContent = game.category;
  gameIframe.src = game.url;
  playerOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  lucide.createIcons();
}

function closePlayer() {
  playerOverlay.classList.add('hidden');
  gameIframe.src = '';
  document.body.style.overflow = '';
}

// Start
init();
