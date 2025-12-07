export function initSnake(container) {
    // Setup Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    canvas.style.background = '#000';
    canvas.style.border = '2px solid var(--color-primary)';
    canvas.style.boxShadow = '0 0 20px rgba(0, 243, 255, 0.2)';
    canvas.style.borderRadius = '8px';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const gridSize = 20;
    let snake = [{ x: 10, y: 10 }];
    let food = { x: 15, y: 15 };
    let dx = 0;
    let dy = 0;
    let score = 0;
    let gameLoopId;
    let highSpeed = false;

    // Controls
    function handleKey(e) {
        switch (e.key) {
            case 'ArrowUp': if (dy === 0) { dx = 0; dy = -1; } break;
            case 'ArrowDown': if (dy === 0) { dx = 0; dy = 1; } break;
            case 'ArrowLeft': if (dx === 0) { dx = -1; dy = 0; } break;
            case 'ArrowRight': if (dx === 0) { dx = 1; dy = 0; } break;
        }
    }
    document.addEventListener('keydown', handleKey);

    function drawRect(x, y, color, glow = false) {
        ctx.fillStyle = color;
        if (glow) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
        } else {
            ctx.shadowBlur = 0;
        }
        ctx.fillRect(x * gridSize, y * gridSize, gridSize - 2, gridSize - 2);
        ctx.shadowBlur = 0; // Reset
    }

    function update() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        // Collision (Walls)
        if (head.x < 0 || head.x >= canvas.width / gridSize ||
            head.y < 0 || head.y >= canvas.height / gridSize ||
            snake.some(s => s.x === head.x && s.y === head.y)) {
            alert(`Game Over! Score: ${score}`);
            resetGame();
            return;
        }

        snake.unshift(head);

        // Eat Food
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            placeFood();
        } else {
            snake.pop(); // Remove tail
        }
    }

    function placeFood() {
        food = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)),
            y: Math.floor(Math.random() * (canvas.height / gridSize))
        };
        // Ensure food doesn't spawn on snake
        if (snake.some(s => s.x === food.x && s.y === food.y)) placeFood();
    }

    function resetGame() {
        snake = [{ x: 10, y: 10 }];
        dx = 0;
        dy = 0;
        score = 0;
        placeFood();
    }

    function draw() {
        // Clear
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Grid (Optional for aesthetics)
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

        // Score
        ctx.fillStyle = '#fff';
        ctx.font = '20px Outfit';
        ctx.fillText(`Score: ${score}`, 10, 30);
    }

    function loop() {
        update();
        draw();
        // Speed control based on input or just fixed
        if (dx !== 0 || dy !== 0) {
            setTimeout(() => requestAnimationFrame(loop), 100);
        } else {
            requestAnimationFrame(loop);
        }
    }

    // Start
    loop();

    // Cleanup function
    return () => {
        document.removeEventListener('keydown', handleKey);
    };
}
