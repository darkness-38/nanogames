import './style.css';
import { CreateGameCard } from './components/GameCard.js';
import { ParticleEngine } from './components/Particles.js';
import { initSnake } from './games/snake/snake.js';
import { initMemory } from './games/memory/memory.js';

import { initClicker } from './games/clicker/clicker.js';

const app = document.querySelector('#app');
let currentGameCleanup = null;

const games = [
  {
    id: 'snake',
    title: 'Neon Snake',
    description: 'A classic challenge reimagined for the void.',
    icon: '🐍',
    onPlay: () => navigateTo('/snake')
  },
  {
    id: 'memory',
    title: 'Cyber Memory',
    description: 'Test your cognitive pattern matching skills.',
    icon: '💠',
    onPlay: () => navigateTo('/memory')
  },
  {
    id: 'clicker',
    title: 'Cosmic Clicker',
    description: 'Harvest entropy and dominate the universe.',
    icon: '🌌',
    onPlay: () => navigateTo('/clicker')
  }
];

// --- Routing ---
function navigateTo(url) {
  history.pushState(null, null, url);
  handleRoute();
}

function handleRoute() {
  const path = window.location.pathname;
  if (currentGameCleanup) {
    currentGameCleanup();
    currentGameCleanup = null;
  }

  if (path === '/snake') {
    renderGame('snake');
  } else if (path === '/memory') {
    renderGame('memory');
  } else if (path === '/clicker') {
    renderGame('clicker');
  } else {
    if (path !== '/') history.replaceState(null, null, '/');
    renderHub();
  }
}
window.addEventListener('popstate', handleRoute);

// --- Rendering ---
function renderHub() {
  app.innerHTML = `
    <canvas id="particles-canvas"></canvas>
    <div class="hero-section">

      <h1 class="hero-title">Experience liftoff<br>with NanoGames.</h1>
      <p class="hero-subtitle">Meticulously crafted mini-games for your cognitive pleasure.</p>
    </div>
    <div class="container">
      <div id="games-grid" class="games-grid"></div>
    </div>
  `;

  // Init Particles
  const canvas = document.getElementById('particles-canvas');
  if (canvas) new ParticleEngine(canvas);

  const grid = document.querySelector('#games-grid');
  if (grid) {
    games.forEach(game => {
      grid.appendChild(CreateGameCard(game));
    });
  }
}

function renderGame(gameId) {
  app.innerHTML = `
    <canvas id="particles-canvas"></canvas>
    <div class="container game-view">
      <h1 class="hero-title" style="font-size: 3rem; margin-bottom: 2rem;">${gameId.toUpperCase()}</h1>
      <div id="game-container" class="game-container"></div>
      <button class="btn-primary" id="back-btn" style="margin-top: 3rem;">Return Orbit</button>
    </div>
  `;

  // Init Particles (background persists style-wise)
  const canvas = document.getElementById('particles-canvas');
  if (canvas) new ParticleEngine(canvas);

  const container = document.getElementById('game-container');
  if (gameId === 'snake') {
    currentGameCleanup = initSnake(container);
  } else if (gameId === 'memory') {
    currentGameCleanup = initMemory(container);
  } else if (gameId === 'clicker') {
    currentGameCleanup = initClicker(container);
  }

  document.getElementById('back-btn').onclick = () => navigateTo('/');
}

// Start
document.addEventListener('DOMContentLoaded', handleRoute);
