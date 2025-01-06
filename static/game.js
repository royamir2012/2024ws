class Game2048 {
    constructor() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        this.init();
    }

    init() {
        this.addNewTile();
        this.addNewTile();
        this.updateGrid();
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

            if (this.isGameOver()) {
                alert('Game Over!');
            }
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

    isGameOver() {
        // Check for any empty cells
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) return false;
            }
        }

        // Check for any possible merges
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (
                    (i < 3 && this.grid[i][j] === this.grid[i + 1][j]) ||
                    (j < 3 && this.grid[i][j] === this.grid[i][j + 1])
                ) {
                    return false;
                }
            }
        }
        return true;
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    let game = new Game2048();

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowUp': 
                e.preventDefault();
                game.move('up'); 
                break;
            case 'ArrowDown': 
                e.preventDefault();
                game.move('down'); 
                break;
            case 'ArrowLeft': 
                e.preventDefault();
                game.move('left'); 
                break;
            case 'ArrowRight': 
                e.preventDefault();
                game.move('right'); 
                break;
        }
    });

    // New game button
    document.getElementById('new-game').addEventListener('click', () => {
        game = new Game2048();
    });

    // Touch controls
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                game.move('right');
            } else {
                game.move('left');
            }
        } else {
            if (deltaY > 0) {
                game.move('down');
            } else {
                game.move('up');
            }
        }
    });
});
