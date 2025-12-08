export function initSnake(container) {
    // Mobile/Responsive check
    const isMobile = window.innerWidth < 600;
    const size = isMobile ? window.innerWidth - 40 : 600;

    // Setup Canvas
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = isMobile ? size : 400;
    canvas.style.background = '#050505';
    canvas.style.border = '2px solid var(--color-primary)';
    canvas.style.boxShadow = '0 0 20px rgba(0, 243, 255, 0.2)';
    canvas.style.borderRadius = '12px';
    // prevent default touch actions on canvas
    canvas.style.touchAction = 'none';

    // Create UI overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '20px';
    overlay.style.left = '50%';
    overlay.style.transform = 'translateX(-50%)';
    overlay.style.color = '#fff';
    overlay.style.fontFamily = 'var(--font-main)';
    overlay.style.fontSize = '1.2rem';
    overlay.style.zIndex = '10';
    overlay.innerHTML = 'Score: <span id="snake-score">0</span>';

    // Container styling to center
    const gameWrapper = document.createElement('div');
    gameWrapper.style.position = 'relative';
    gameWrapper.style.display = 'flex';
    gameWrapper.style.justifyContent = 'center';

    gameWrapper.appendChild(overlay);
    gameWrapper.appendChild(canvas);
    container.appendChild(gameWrapper);

    // Mobile Controls
    if (isMobile) {
        const controls = document.createElement('div');
        controls.style.display = 'grid';
        controls.style.gridTemplateColumns = 'repeat(3, 1fr)';
        controls.style.gap = '10px';
        controls.style.marginTop = '20px';
        controls.style.maxWidth = '200px';

        const btnStyle = 'background: rgba(255,255,255,0.1); border: 1px solid var(--color-primary); color: white; padding: 15px; border-radius: 8px; font-size: 1.5rem;';

        controls.innerHTML = `
      <div></div>
      <button style="${btnStyle}" id="btn-up">⬆️</button>
      <div></div>
      <button style="${btnStyle}" id="btn-left">⬅️</button>
      <button style="${btnStyle}" id="btn-down">⬇️</button>
      <button style="${btnStyle}" id="btn-right">➡️</button>
    `;
        container.appendChild(controls);

        // Add listeners
        setTimeout(() => {
            document.getElementById('btn-up').onclick = () => changeDir(0, -1);
            document.getElementById('btn-down').onclick = () => changeDir(0, 1);
            document.getElementById('btn-left').onclick = () => changeDir(-1, 0);
            document.getElementById('btn-right').onclick = () => changeDir(1, 0);
        }, 0);
    }

    const ctx = canvas.getContext('2d');
    const gridSize = 20;
    let snake = [{ x: 10, y: 10 }];
    let food = { x: 15, y: 15 };
    let dx = 0;
    let dy = 0;
    let score = 0;
    let running = true;
    let lastTime = 0;
    const speed = 100; // ms

    // Controls
    function changeDir(x, y) {
        // Prevent reverse
        if (x !== 0 && dx === -x) return;
        if (y !== 0 && dy === -y) return;
        dx = x;
        dy = y;
        if (!running) {
            running = true;
            loop();
        }
    }

    function handleKey(e) {
        // Prevent scrolling for arrow keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code) > -1) {
            e.preventDefault();
        }

        switch (e.key) {
            case 'ArrowUp': changeDir(0, -1); break;
            case 'ArrowDown': changeDir(0, 1); break;
            case 'ArrowLeft': changeDir(-1, 0); break;
            case 'ArrowRight': changeDir(1, 0); break;
        }
    }

    // Attach query listener globally but remove on cleanup
    window.addEventListener('keydown', handleKey);

    function drawRect(x, y, color, glow = false) {
        const px = x * gridSize;
        const py = y * gridSize;

        ctx.fillStyle = color;
        if (glow) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
        } else {
            ctx.shadowBlur = 0;
        }
        ctx.fillRect(px, py, gridSize - 2, gridSize - 2);
        ctx.shadowBlur = 0; // Reset
    }

    function update() {
        if (!running) return;

        if (dx === 0 && dy === 0) return; // Wait for start

        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        // Collision (Walls)
        const maxX = Math.floor(canvas.width / gridSize);
        const maxY = Math.floor(canvas.height / gridSize);

        if (head.x < 0 || head.x >= maxX ||
            head.y < 0 || head.y >= maxY ||
            snake.some(s => s.x === head.x && s.y === head.y)) {
            alert(`Game Over! Score: ${score}`);
            resetGame();
            return;
        }

        snake.unshift(head);

        // Eat Food
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            document.getElementById('snake-score').innerText = score;
            placeFood();
        } else {
            snake.pop(); // Remove tail
        }
    }

    function placeFood() {
        const maxX = Math.floor(canvas.width / gridSize);
        const maxY = Math.floor(canvas.height / gridSize);
        food = {
            x: Math.floor(Math.random() * maxX),
            y: Math.floor(Math.random() * maxY)
        };
        // Ensure food doesn't spawn on snake
        if (snake.some(s => s.x === food.x && s.y === food.y)) placeFood();
    }

    function resetGame() {
        snake = [{ x: 10, y: 10 }];
        dx = 0;
        dy = 0;
        score = 0;
        const scoreEl = document.getElementById('snake-score');
        if (scoreEl) scoreEl.innerText = '0';
        placeFood();
    }

    function draw() {
        // Clear
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Grid
        ctx.strokeStyle = '#111';
        for (let i = 0; i < canvas.width; i += gridSize) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += gridSize) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
        }

        // Draw Food
        drawRect(food.x, food.y, '#ff00ff', true);

        // Draw Snake
        snake.forEach((s, i) => {
            // Head is different color
            const color = i === 0 ? '#00f3ff' : '#00a8b3';
            drawRect(s.x, s.y, color, i === 0);
        });
    }

    function loop(timestamp) {
        if (!running) return;

        if (timestamp - lastTime > speed) {
            update();
            draw();
            lastTime = timestamp;
        }

        requestAnimationFrame(loop);
    }

    // Start
    requestAnimationFrame(loop);

    // Cleanup function
    return () => {
        running = false;
        window.removeEventListener('keydown', handleKey);
        container.innerHTML = '';
    };
}
