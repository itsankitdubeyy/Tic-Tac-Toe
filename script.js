class UltimateTicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameMode = 'pvp';
        this.playerNames = { X: 'Player X', O: 'Player O' };
        this.scores = { X: 0, O: 0 };
        this.gameStartTime = null;
        this.gameTimer = null;
        this.turnTimer = null;
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        this.initializeGame();
    }

    initializeGame() {
        this.setupScreen = document.getElementById('setup-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.startBtn = document.getElementById('startBtn');
        this.playerXInput = document.getElementById('playerX');
        this.playerOInput = document.getElementById('playerO');
        this.gameModeSelect = document.getElementById('gameMode');
        this.cells = document.querySelectorAll('.cell');
        this.turnIndicator = document.getElementById('turn-indicator');
        this.gameStatus = document.getElementById('game-status');
        this.restartBtn = document.getElementById('restartBtn');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.scoreX = document.getElementById('scoreX');
        this.scoreO = document.getElementById('scoreO');
        this.timerDisplay = document.getElementById('timer');
        this.themeBtn = document.getElementById('themeBtn');
        this.winModal = document.getElementById('winModal');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.winnerText = document.getElementById('winnerText');

        this.bindEvents();
        this.initializeTheme();
        this.createParticles();
    }

    bindEvents() {
        this.startBtn.addEventListener('click', this.startGame.bind(this));
        this.cells.forEach(cell => {
            cell.addEventListener('click', this.handleCellClick.bind(this));
        });
        this.restartBtn.addEventListener('click', this.restartGame.bind(this));
        this.newGameBtn.addEventListener('click', this.newGame.bind(this));
        this.themeBtn.addEventListener('click', this.toggleTheme.bind(this));
        this.playAgainBtn.addEventListener('click', this.playAgain.bind(this));
        
        // Keyboard support
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('tic-tac-toe-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('tic-tac-toe-theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const icon = this.themeBtn.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    createParticles() {
        const particles = document.querySelector('.particles');
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 1}px;
                height: ${Math.random() * 4 + 1}px;
                background: rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 20}s;
            `;
            particles.appendChild(particle);
        }
    }

    startGame() {
        const nameX = this.playerXInput.value.trim() || 'Player X';
        const nameO = this.playerOInput.value.trim() || 'Player O';
        this.gameMode = this.gameModeSelect.value;
        
        this.playerNames = { X: nameX, O: nameO };
        
        if (this.gameMode.includes('ai')) {
            this.playerNames.O = 'AI';
        }
        
        this.setupScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        this.updateScoreBoard();
        this.updateTurnIndicator();
        this.startGameTimer();
        this.playSound('start');
    }

    handleCellClick(event) {
        const cell = event.target.closest('.cell');
        const index = parseInt(cell.dataset.index);

        if (this.board[index] !== '' || !this.gameActive) {
            return;
        }

        this.makeMove(index, cell);
        this.playSound('move');
        
        if (this.checkWinner()) {
            this.handleWin();
        } else if (this.checkDraw()) {
            this.handleDraw();
        } else {
            this.switchPlayer();
            
            // AI move
            if (this.gameActive && this.gameMode.includes('ai') && this.currentPlayer === 'O') {
                setTimeout(() => this.makeAIMove(), 500);
            }
        }
    }

    makeMove(index, cell) {
        this.board[index] = this.currentPlayer;
        const content = cell.querySelector('.cell-content');
        content.textContent = this.currentPlayer;
        cell.classList.add('taken', this.currentPlayer.toLowerCase());
    }

    makeAIMove() {
        let move;
        if (this.gameMode === 'ai-hard') {
            move = this.getBestMove();
        } else {
            move = this.getRandomMove();
        }
        
        if (move !== -1) {
            const cell = this.cells[move];
            this.makeMove(move, cell);
            this.playSound('move');
            
            if (this.checkWinner()) {
                this.handleWin();
            } else if (this.checkDraw()) {
                this.handleDraw();
            } else {
                this.switchPlayer();
            }
        }
    }

    getBestMove() {
        // Minimax algorithm for hard AI
        let bestScore = -Infinity;
        let bestMove = -1;
        
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false);
                this.board[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        return bestMove;
    }

    minimax(board, depth, isMaximizing) {
        if (this.checkWinnerForBoard(board, 'O')) return 10 - depth;
        if (this.checkWinnerForBoard(board, 'X')) return depth - 10;
        if (board.every(cell => cell !== '')) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    checkWinnerForBoard(board, player) {
        return this.winningCombinations.some(combination => {
            const [a, b, c] = combination;
            return board[a] === player && board[b] === player && board[c] === player;
        });
    }

    getRandomMove() {
        const availableMoves = [];
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                availableMoves.push(i);
            }
        }
        return availableMoves.length > 0 ? 
            availableMoves[Math.floor(Math.random() * availableMoves.length)] : -1;
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateTurnIndicator();
        this.startTurnTimer();
    }

    checkWinner() {
        return this.winningCombinations.some(combination => {
            const [a, b, c] = combination;
            return this.board[a] && 
                   this.board[a] === this.board[b] && 
                   this.board[a] === this.board[c];
        });
    }

    checkDraw() {
        return this.board.every(cell => cell !== '');
    }

    handleWin() {
        this.scores[this.currentPlayer]++;
        this.updateScoreBoard();
        this.highlightWinningCells();
        this.endGame(`${this.playerNames[this.currentPlayer]} Wins!`, 'winner');
        this.showWinModal(`${this.playerNames[this.currentPlayer]} Wins!`);
        this.playSound('win');
    }

    handleDraw() {
        this.endGame("It's a Draw!", 'draw');
        this.showWinModal("It's a Draw!");
        this.playSound('draw');
    }

    highlightWinningCells() {
        const winningCombination = this.winningCombinations.find(combination => {
            const [a, b, c] = combination;
            return this.board[a] && 
                   this.board[a] === this.board[b] && 
                   this.board[a] === this.board[c];
        });

        if (winningCombination) {
            winningCombination.forEach(index => {
                this.cells[index].classList.add('winning-cell');
            });
        }
    }

    endGame(message, type) {
        this.gameActive = false;
        this.gameStatus.textContent = message;
        this.gameStatus.className = `game-status ${type}`;
        this.turnIndicator.querySelector('.turn-text').textContent = 'Game Over';
        this.stopTimers();
        
        this.cells.forEach(cell => {
            cell.classList.add('taken');
        });
    }

    showWinModal(message) {
        this.winnerText.textContent = message;
        this.winModal.classList.remove('hidden');
    }

    playAgain() {
        this.winModal.classList.add('hidden');
        this.newGame();
    }

    newGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        this.cells.forEach(cell => {
            const content = cell.querySelector('.cell-content');
            content.textContent = '';
            cell.className = 'cell';
        });
        
        this.gameStatus.textContent = '';
        this.gameStatus.className = 'game-status';
        this.updateTurnIndicator();
        this.startGameTimer();
    }

    restartGame() {
        this.scores = { X: 0, O: 0 };
        this.stopTimers();
        this.gameScreen.classList.add('hidden');
        this.setupScreen.classList.remove('hidden');
        this.playerXInput.value = '';
        this.playerOInput.value = '';
        this.winModal.classList.add('hidden');
    }

    updateTurnIndicator() {
        const turnText = this.turnIndicator.querySelector('.turn-text');
        turnText.textContent = `${this.playerNames[this.currentPlayer]}'s Turn`;
        
        const indicator = this.turnIndicator;
        indicator.style.background = this.currentPlayer === 'X' ? 
            'linear-gradient(45deg, #ff6b6b, #ff8a80)' : 
            'linear-gradient(45deg, #667eea, #8c9eff)';
    }

    updateScoreBoard() {
        const scoreXName = this.scoreX.querySelector('.player-name');
        const scoreXCount = this.scoreX.querySelector('.score-count');
        const scoreOName = this.scoreO.querySelector('.player-name');
        const scoreOCount = this.scoreO.querySelector('.score-count');
        
        scoreXName.textContent = this.playerNames.X;
        scoreXCount.textContent = this.scores.X;
        scoreOName.textContent = this.playerNames.O;
        scoreOCount.textContent = this.scores.O;
    }

    startGameTimer() {
        this.gameStartTime = Date.now();
        this.gameTimer = setInterval(() => {
            const elapsed = Date.now() - this.gameStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            this.timerDisplay.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    startTurnTimer() {
        const turnTimer = this.turnIndicator.querySelector('.turn-timer');
        turnTimer.style.animation = 'none';
        turnTimer.offsetHeight; // Trigger reflow
        turnTimer.style.animation = 'turnTimer 10s linear';
    }

    stopTimers() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        if (this.turnTimer) {
            clearTimeout(this.turnTimer);
            this.turnTimer = null;
        }
    }

    handleKeyPress(event) {
        if (!this.gameActive || this.currentPlayer === 'O' && this.gameMode.includes('ai')) return;
        
        const keyMap = {
            '1': 6, '2': 7, '3': 8,
            '4': 3, '5': 4, '6': 5,
            '7': 0, '8': 1, '9': 2
        };
        
        if (keyMap[event.key] !== undefined) {
            const index = keyMap[event.key];
            if (this.board[index] === '') {
                this.handleCellClick({ target: this.cells[index] });
            }
        }
    }

    playSound(type) {
        // Simple sound feedback using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'move':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                break;
            case 'win':
                oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                break;
            case 'draw':
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                break;
        }
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UltimateTicTacToe();
});