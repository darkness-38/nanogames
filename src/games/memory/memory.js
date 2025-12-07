export function initMemory(container) {
    const icons = ['👾', '🤖', '👽', '🚀', '🛸', '⭐', '💎', '🧬'];
    // Double the icons for pairs
    let cards = [...icons, ...icons];
    let flippedCards = [];
    let matchedPairs = 0;
    let score = 0;
    let canFlip = true;

    // Shuffle
    cards.sort(() => Math.random() - 0.5);

    const grid = document.createElement('div');
    grid.className = 'memory-grid';
    container.appendChild(grid);

    // Score display
    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'glow-text';
    scoreDisplay.style.fontSize = '1.5rem';
    scoreDisplay.style.marginBottom = '1rem';
    scoreDisplay.textContent = `Score: ${score}`;
    container.insertBefore(scoreDisplay, grid);

    cards.forEach((icon, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.icon = icon;
        card.dataset.index = index;

        card.innerHTML = `
      <div class="memory-card-inner">
        <div class="memory-card-front">?</div>
        <div class="memory-card-back">${icon}</div>
      </div>
    `;

        card.onclick = () => flipCard(card);
        grid.appendChild(card);
    });

    function flipCard(card) {
        if (!canFlip || card.classList.contains('flipped') || card.classList.contains('matched')) return;

        card.classList.add('flipped');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            checkMatch();
        }
    }

    function checkMatch() {
        canFlip = false;
        const [card1, card2] = flippedCards;

        if (card1.dataset.icon === card2.dataset.icon) {
            // Match
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            score += 100;
            scoreDisplay.textContent = `Score: ${score}`;
            flippedCards = [];
            canFlip = true;

            if (matchedPairs === icons.length) {
                setTimeout(() => alert(`You Won! Final Score: ${score}`), 500);
            }
        } else {
            // No match
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
                canFlip = true;
            }, 1000);
        }
    }

    return () => {
        // Cleanup if needed
        container.innerHTML = '';
    };
}
