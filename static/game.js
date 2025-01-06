class Game2048 {
    constructor() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.gameOver = false;
        this.currentHighestInGame = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.setupHighScoreUpdates();
        this.fetchGlobalHigh();
        this.initializeGame();
        this.setupControls();
    }

    setupHighScoreUpdates() {
        const eventSource = new EventSource('/high-score-updates');
        
        eventSource.onmessage = async (event) => {
            if (event.data === 'update') {
                // Refresh our high scores
                await this.fetchGlobalHigh();
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE Error:', error);
            eventSource.close();
            // Try to reconnect after 5 seconds
            setTimeout(() => this.setupHighScoreUpdates(), 5000);
        };

        // Clean up EventSource when the window is closed
        window.addEventListener('beforeunload', () => {
            eventSource.close();
        });
    }

    async fetchGlobalHigh() {
        try {
            const response = await fetch('/global-high');
            const data = await response.json();
            if (data.status === 'success') {
                this.highestNumber = data.highest_number;
                this.bestTimeForHighest = data.best_time;
                this.updateDisplays();
            }
        } catch (error) {
            console.error('Error fetching global high score:', error);
        }
    }

    async updateGlobalHigh(number, time) {
        try {
            const response = await fetch('/update-global-high', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ number, time })
            });
            const data = await response.json();
            if (data.status === 'success' && data.message !== 'No new record') {
                // Refresh global high scores
                await this.fetchGlobalHigh();
            }
        } catch (error) {
            console.error('Error updating global high score:', error);
        }
    }

    updateHighestNumber(number) {
        this.currentHighestInGame = Math.max(this.currentHighestInGame, number);
        const currentTime = Math.floor((Date.now() - this.startTime) / 1000);
        
        if (number >= this.highestNumber) {
            this.updateGlobalHigh(number, currentTime);
        }
    }

    updateDisplays() {
        document.getElementById('highest-number').textContent = this.highestNumber || 0;
        document.getElementById('best-time').textContent = this.formatTime(this.bestTimeForHighest);
    }

    initializeGame() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.gameOver = false;
        this.currentHighestInGame = 0;
        this.addNewTile();
        this.addNewTile();
        this.updateGrid();
        this.startTimer();
        trackEvent('new_game');
    }

    startTimer() {
        // Clear existing timer if any
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Set start time
        this.startTime = Date.now();
        
        // Update timer every second
        this.timerInterval = setInterval(() => {
            if (!this.gameOver) {
                const currentTime = Date.now();
                const elapsedTime = Math.floor((currentTime - this.startTime) / 1000);
                const minutes = Math.floor(elapsedTime / 60);
                const seconds = elapsedTime % 60;
                document.getElementById('timer').textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            if (this.gameOver) return;
            
            let moved = false;
            switch(event.key) {
                case 'ArrowUp':
                    moved = this.move('up');
                    break;
                case 'ArrowDown':
                    moved = this.move('down');
                    break;
                case 'ArrowLeft':
                    moved = this.move('left');
                    break;
                case 'ArrowRight':
                    moved = this.move('right');
                    break;
                default:
                    return;
            }
            
            if (moved) {
                this.addNewTile();
                this.updateGrid();
                this.checkGameOver();
            }
        });

        // Touch controls
        const touchAreas = document.querySelectorAll('.touch-area');
        touchAreas.forEach(area => {
            area.addEventListener('click', (event) => {
                if (this.gameOver) return;
                
                const direction = area.dataset.direction;
                if (this.move(direction)) {
                    this.addNewTile();
                    this.updateGrid();
                    this.checkGameOver();
                }
            });
        });

        // New game button
        document.getElementById('new-game').addEventListener('click', () => {
            this.initializeGame();
        });
    }

    move(direction) {
        let moved = false;
        const oldGrid = JSON.stringify(this.grid);

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

        return moved;
    }

    moveLeft() {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            let row = this.grid[i].filter(cell => cell !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.updateHighestNumber(row[j]);
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
                    this.updateHighestNumber(row[j]);
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
                    this.updateHighestNumber(column[i]);
                    column.splice(i + 1, 1);
                }
            }
            const newColumn = column.concat(Array(4 - column.length).fill(0));
            for (let i = 0; i < 4; i++) {
                if (this.grid[i][j] !== newColumn[i]) {
                    moved = true;
                }
                this.grid[i][j] = newColumn[i];
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
                    this.updateHighestNumber(column[i]);
                    column.splice(i - 1, 1);
                    i--;
                }
            }
            const newColumn = Array(4 - column.length).fill(0).concat(column);
            for (let i = 0; i < 4; i++) {
                if (this.grid[i][j] !== newColumn[i]) {
                    moved = true;
                }
                this.grid[i][j] = newColumn[i];
            }
        }
        return moved;
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

        // Update displays
        this.updateDisplays();
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    formatTime(seconds) {
        if (!seconds) return '--:--';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    checkGameOver() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) return false;
                if (i < 3 && this.grid[i][j] === this.grid[i + 1][j]) return false;
                if (j < 3 && this.grid[i][j] === this.grid[i][j + 1]) return false;
            }
        }
        this.gameOver = true;
        this.stopTimer();
        
        return true;
    }
}

// Track game events
function trackEvent(eventType, eventData) {
    fetch('/track', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            event_type: eventType,
            event_data: eventData,
            platform: 'web'
        })
    }).catch(error => console.error('Error tracking event:', error));
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    let game = new Game2048();
});
