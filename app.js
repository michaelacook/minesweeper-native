/* Game interaction layer */

const beginner = {rows: 9, columns: 9, mines: 10}
const intermediate = {rows: 16, columns: 16, mines: 40}
const expert = {rows: 16, columns: 30, mines: 99}

const game = new Game();
const grid = document.getElementById('grid');
const gameArea = document.getElementById('gameArea');
const gameStatus = document.getElementById('game-status');
const timer = document.getElementById('timer');
const difficultySelect = document.getElementById('difficulty');

const electron = require('electron');
const ipc = electron.ipcRenderer;

function resizeWindow(x, y) {
    ipc.send('resize', x, y);
}


// Handle main game logic, start timer on first click
grid.addEventListener('click', e => {
    game.handleClick(e);
    if (game.active && !game.timerStarted) {
        game.startTimer();
    }
});


// Prevent context menu from appearing on right click of grid space
grid.addEventListener('contextmenu', e => {
    e.preventDefault();
    game.handleClick(e);
});


// Start game with desired difficulty
document.getElementById('game-status').addEventListener('click', e => {
    const difficulty = document.getElementById('difficulty').value;
    game.stopTimer();
    timer.innerHTML = '000';
    switch (difficulty) {
        case 'beginner':
            game.start(beginner);
            break;
        case 'intermediate':
            game.start(intermediate);
            break;
        case 'expert':
            game.start(expert);
            break;
        default:
            game.start(beginner);
    }
});


// Difficulty setting
difficultySelect.addEventListener('change', e => {
    e.target.blur();
    const children = document.querySelector('.controls').children;
    gameStatus.className = 'smiley';
    game.stopTimer();
    timer.innerHTML = '000';
    const gameArea = document.getElementById('gameArea');
    if (difficultySelect.value == 'beginner') {
        game.start(beginner);
        gameArea.style.width = '287px';
        gameArea.style.height = '';
        resizeWindow(330, 451);
    } else if (difficultySelect.value == 'intermediate') {
        game.start(intermediate);
        gameArea.style.width = '502.25px';
        gameArea.style.height = '578.75px';
        resizeWindow(545, 670);
    } else if (difficultySelect.value == 'expert') {
        game.start(expert);
        gameArea.style.width = '932.75px';
        resizeWindow(976, 670);
    }
});


// Animating smiley button
gameStatus.addEventListener('mousedown', e => {
    event.target.classList.remove('smiley');
    event.target.className = 'down-smiley';
});

gameStatus.addEventListener('mouseup', e => {
    event.target.classList.remove('down-smiley');
    event.target.className = 'smiley';
});

grid.addEventListener('mousedown', e => {
    if (game.active) {
        gameStatus.classList.remove('smiley');
        gameStatus.className = 'o-smiley';
    }
});

grid.addEventListener('mouseup', e => {
    if (game.active) {
        gameStatus.classList.remove('o-smiley');
        gameStatus.className = 'smiley';
    }
});
