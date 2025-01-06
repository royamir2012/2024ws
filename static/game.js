class Game2048 {
    constructor() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        this.achievedScores = new Set();
        this.gameOver = false;
        this.highestTileAchieved = 0;
        this.initializeGame();
        this.setupControls();
    }

    initializeGame() {
        this.addNewTile();
        this.addNewTile();
        this.updateGrid();
    }

    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            if (this.gameOver) return;
            
            let moved = false;
            switch(event.key) {
                case 'ArrowUp':
                    moved = this.moveUp();
                    if (moved) trackEvent('move', 'up');
                    break;
                case 'ArrowDown':
                    moved = this.moveDown();
                    if (moved) trackEvent('move', 'down');
                    break;
                case 'ArrowLeft':
                    moved = this.moveLeft();
                    if (moved) trackEvent('move', 'left');
                    break;
                case 'ArrowRight':
                    moved = this.moveRight();
                    if (moved) trackEvent('move', 'right');
                    break;
            }
            
            if (moved) {
                this.addNewTile();
                this.updateGrid();
                this.checkGameOver();
                this.saveGameState();
            }
        });

        // Touch controls
        if ('ontouchstart' in window) {
            this.setupTouchControls();
        }
    }

    setupTouchControls() {
        const touchAreas = document.querySelectorAll('.touch-area');
        touchAreas.forEach(area => {
            area.addEventListener('click', (event) => {
                if (this.gameOver) return;
                
                const direction = event.target.dataset.direction;
                let moved = false;
                
                switch(direction) {
                    case 'up':
                        moved = this.moveUp();
                        if (moved) trackEvent('move', 'up');
                        break;
                    case 'down':
                        moved = this.moveDown();
                        if (moved) trackEvent('move', 'down');
                        break;
                    case 'left':
                        moved = this.moveLeft();
                        if (moved) trackEvent('move', 'left');
                        break;
                    case 'right':
                        moved = this.moveRight();
                        if (moved) trackEvent('move', 'right');
                        break;
                }
                
                if (moved) {
                    this.addNewTile();
                    this.updateGrid();
                    this.checkGameOver();
                    this.saveGameState();
                }
            });
        });
    }

    addNewTile() {
        const emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    updateGrid() {
        const container = document.getElementById('grid-container');
        container.innerHTML = '';
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                if (this.grid[i][j] !== 0) {
                    cell.textContent = this.grid[i][j];
                    cell.classList.add(`tile-${this.grid[i][j]}`);
                }
                container.appendChild(cell);
            }
        }

        document.getElementById('score').textContent = this.score;
        document.getElementById('best-score').textContent = this.bestScore;
    }

    move(direction) {
        let moved = false;
        const oldGrid = JSON.stringify(this.grid);

        switch(direction) {
            case 'up': moved = this.moveUp(); break;
            case 'down': moved = this.moveDown(); break;
            case 'left': moved = this.moveLeft(); break;
            case 'right': moved = this.moveRight(); break;
        }

        if (moved) {
            this.addNewTile();
            this.updateGrid();
            
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem('bestScore', this.bestScore);
            }

            this.checkGameOver();
            this.saveGameState();
            trackEvent('move', direction);
        }
    }

    moveLeft() {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            let row = this.grid[i].filter(cell => cell !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    this.checkAchievement(row[j]);
                    row.splice(j + 1, 1);
                }
            }
            const newRow = row.concat(Array(4 - row.length).fill(0));
            if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[i] = newRow;
        }
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            let row = this.grid[i].filter(cell => cell !== 0);
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    this.checkAchievement(row[j]);
                    row.splice(j - 1, 1);
                    j--;
                }
            }
            const newRow = Array(4 - row.length).fill(0).concat(row);
            if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[i] = newRow;
        }
        return moved;
    }

    moveUp() {
        let moved = false;
        for (let j = 0; j < 4; j++) {
            let column = [];
            for (let i = 0; i < 4; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    this.checkAchievement(column[i]);
                    column.splice(i + 1, 1);
                }
            }
            column = column.concat(Array(4 - column.length).fill(0));
            for (let i = 0; i < 4; i++) {
                if (this.grid[i][j] !== column[i]) {
                    moved = true;
                }
                this.grid[i][j] = column[i];
            }
        }
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let j = 0; j < 4; j++) {
            let column = [];
            for (let i = 0; i < 4; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }
            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    this.checkAchievement(column[i]);
                    column.splice(i - 1, 1);
                    i--;
                }
            }
            column = Array(4 - column.length).fill(0).concat(column);
            for (let i = 0; i < 4; i++) {
                if (this.grid[i][j] !== column[i]) {
                    moved = true;
                }
                this.grid[i][j] = column[i];
            }
        }
        return moved;
    }

    checkAchievement(value) {
        if ((value === 8 || value === 16) && !this.achievedScores.has(value)) {
            this.achievedScores.add(value);
            this.playAchievement();
            this.showConfetti();
            trackEvent('achievement', value.toString());
        }
    }

    playAchievement() {
        const sound = document.getElementById('achievement-sound');
        sound.currentTime = 0;
        sound.play();
    }

    showConfetti() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    checkGameOver() {
        // Check for any empty cells
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) return;
            }
        }

        // Check for any possible merges
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (
                    (i < 3 && this.grid[i][j] === this.grid[i + 1][j]) ||
                    (j < 3 && this.grid[i][j] === this.grid[i][j + 1])
                ) {
                    return;
                }
            }
        }
        this.gameOver = true;
        trackEvent('game_over', this.score.toString());
    }

    getHighestTile() {
        let highestTile = 0;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] > highestTile) {
                    highestTile = this.grid[i][j];
                }
            }
        }
        return highestTile;
    }

    saveGameState() {
        localStorage.setItem('gameState', JSON.stringify(this.grid));
        localStorage.setItem('score', this.score);
    }
}

// Track game events
async function trackEvent(eventType, eventData) {
    try {
        const response = await fetch('/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event_type: eventType,
                event_data: eventData,
                platform: 'web'
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error tracking event:', errorData.message);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error tracking event:', error);
        return false;
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    let game = new Game2048();

    // New game button
    document.getElementById('new-game').addEventListener('click', () => {
        trackEvent('new_game');
        game = new Game2048();
    });
});
