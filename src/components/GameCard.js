export function CreateGameCard(game) {
  const card = document.createElement('div');
  card.className = 'game-card';

  card.innerHTML = `
    <div class="card-content">
      <div class="card-icon">${game.icon}</div>
      <h3 class="card-title">${game.title}</h3>
      <p class="card-desc">${game.description}</p>
      <button class="btn-primary play-btn">Play Now</button>
    </div>
    <div class="card-bg"></div>
  `;



  // Interaction - Make whole card clickable
  card.onclick = (e) => {
    e.preventDefault(); // Prevent default if any
    game.onPlay();
  };

  return card;
}
