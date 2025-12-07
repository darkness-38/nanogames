import './style.css'
import { CreateGameCard } from './src/components/GameCard.js'
import { initSnake } from './src/games/snake/snake.js';
import { initMemory } from './src/games/memory/memory.js';

const app = document.querySelector('#app');

const games = [
  {
    id: 'snake',
    title: 'Neon Snake',
    description: 'Navigate the cyber grid and grow your snake.',
    icon: '🐍',
    onPlay: () => loadGame('snake')
  },
  {
    id: 'memory',
    title: 'Cyber Memory',
    description: 'Hack the system by matching data blocks.',
    icon: '💾',
    onPlay: () => loadGame('memory')
  }
];

function renderHub() {
  app.innerHTML = `
    <div class="hero-section">
      <h1 class="hero-title"><span class="glow-text">NANO</span>GAMES</h1>
      <p class="hero-subtitle">Premium Mini-Games Collection</p>
    </div>
    <div class="container">
      <div id="games-grid" class="games-grid"></div>
    </div>
  `;

  const grid = document.querySelector('#games-grid');
  if (grid) {
    games.forEach(game => {
      grid.appendChild(CreateGameCard(game));
    });
  }
}

function loadGame(gameId) {
  console.log('Loading game:', gameId);
  app.innerHTML = `
    <div class="container" style="padding-top: 50px; text-align: center;">
      <h1 class="glow-text" style="margin-bottom: 2rem;">${gameId.toUpperCase()}</h1>
      <div id="game-container" style="display: flex; flex-direction: column; align-items: center;"></div>
      <button class="btn-primary" id="back-btn" style="margin-top: 2rem;">Back to Hub</button>
    </div>
  `;

  const container = document.getElementById('game-container');
  let cleanup = null;

  if (gameId === 'snake') {
    cleanup = initSnake(container);
  } else if (gameId === 'memory') {
    cleanup = initMemory(container);
  }

  document.getElementById('back-btn').onclick = () => {
    if (cleanup) cleanup();
    renderHub();
  };
}

// Initialize
renderHub();
