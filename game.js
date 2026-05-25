// Default Level constants
const DEFAULT_BOARD_SIZE = 9;
const DEFAULT_OBSTACLES = [
    {row: 2, col: 3},
    {row: 3, col: 3}, {row: 3, col: 4}, {row: 3, col: 5},
    {row: 4, col: 2}, {row: 4, col: 3}, {row: 4, col: 4},
    {row: 5, col: 5}
];
const DEFAULT_TARGETS = [
    {row: 6, col: 6}, {row: 6, col: 7}, {row: 6, col: 8},
    {row: 7, col: 6},                  {row: 7, col: 8},
    {row: 8, col: 6}, {row: 8, col: 7}, {row: 8, col: 8}
];
const DEFAULT_INITIAL_BLOCKS = [
    {row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2},
    {row: 1, col: 0},                  {row: 1, col: 2},
    {row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}
];

// Active Level Configuration (Defaults to standard game layout)
let activeBoardSize = DEFAULT_BOARD_SIZE;
let activeObstacles = [...DEFAULT_OBSTACLES];
let activeTargets = [...DEFAULT_TARGETS];
let activeInitialBlocks = [...DEFAULT_INITIAL_BLOCKS];

// Game state
let blocks = [];
let history = [];
let moves = 0;
let isGameActive = true;

// DOM Elements
const boardEl = document.getElementById('game-board');
const moveCountEl = document.getElementById('move-count');
const coverageCountEl = document.getElementById('coverage-count');
const btnUndo = document.getElementById('btn-undo');
const btnReset = document.getElementById('btn-reset');
const victoryModal = document.getElementById('victory-modal');
const finalMovesEl = document.getElementById('final-moves');
const btnPlayAgain = document.getElementById('btn-play-again');

// Touch swipe tracking
let touchStartX = 0;
let touchStartY = 0;
const SWIPE_THRESHOLD = 30; // Minimum swipe distance in pixels

// Helper: Check if coordinates match
const isSameCoord = (c1, c2) => c1.row === c2.row && c1.col === c2.col;

// Helper: Check if coordinate is an obstacle
const isObstacle = (row, col) => activeObstacles.some(obs => obs.row === row && obs.col === col);

// Helper: Check if coordinate is within board boundaries
const isWithinBoard = (row, col) => row >= 0 && row < activeBoardSize && col >= 0 && col < activeBoardSize;

// Custom Level Parsing from URL query parameters
function parseCustomLevel() {
    const urlParams = new URLSearchParams(window.location.search);
    const levelDataParam = urlParams.get('level');
    if (levelDataParam) {
        try {
            const decodedData = JSON.parse(decodeURIComponent(escape(atob(levelDataParam))));
            if (decodedData && decodedData.size && decodedData.blocks && decodedData.obstacles && decodedData.targets) {
                activeBoardSize = decodedData.size;
                activeObstacles = decodedData.obstacles;
                activeTargets = decodedData.targets;
                activeInitialBlocks = decodedData.blocks;
                
                // Show custom banner
                const banner = document.getElementById('custom-level-banner');
                if (banner) {
                    banner.classList.remove('hidden');
                }
            }
        } catch (e) {
            console.error("Failed to parse custom level:", e);
        }
    }
}

// Initialize the game board UI
function initBoard() {
    parseCustomLevel();
    
    boardEl.innerHTML = '';
    
    // Set custom board size property for CSS Grid
    boardEl.style.setProperty('--board-size', activeBoardSize);
    
    // 1. Create background grid cells
    for (let r = 0; r < activeBoardSize; r++) {
        for (let c = 0; c < activeBoardSize; c++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            
            // Tag special cells
            if (isObstacle(r, c)) {
                cell.classList.add('obstacle-cell');
            } else if (activeTargets.some(t => t.row === r && t.col === c)) {
                cell.classList.add('target-cell');
            }
            
            boardEl.appendChild(cell);
        }
    }

    // 2. Create moving yellow blocks and keep references
    blocks = activeInitialBlocks.map((block, index) => {
        const blockEl = document.createElement('div');
        blockEl.classList.add('block-yellow');
        blockEl.id = `block-${index}`;
        boardEl.appendChild(blockEl);
        
        return {
            id: index,
            row: block.row,
            col: block.col,
            element: blockEl
        };
    });

    updateBlockPositions();
    updateStats();
}

// Update block elements to match state coordinates
function updateBlockPositions() {
    blocks.forEach(block => {
        block.element.style.setProperty('--row', block.row);
        block.element.style.setProperty('--col', block.col);
    });
}

// Update moves and target coverage count UI
function updateStats() {
    moveCountEl.textContent = moves;
    
    // Count how many yellow blocks cover blue targets
    let covered = 0;
    blocks.forEach(b => {
        if (activeTargets.some(t => t.row === b.row && t.col === b.col)) {
            covered++;
        }
    });
    
    coverageCountEl.textContent = `${covered} / ${activeTargets.length}`;
    btnUndo.disabled = history.length === 0;
}

// Sort blocks based on movement direction to prevent collisions and ensure proper stacking
function getSortedBlocksForDirection(dRow, dCol) {
    const sorted = [...blocks];
    if (dCol > 0) {
        // Moving Right: process right-most first (descending col)
        sorted.sort((a, b) => b.col - a.col);
    } else if (dCol < 0) {
        // Moving Left: process left-most first (ascending col)
        sorted.sort((a, b) => a.col - b.col);
    } else if (dRow > 0) {
        // Moving Down: process bottom-most first (descending row)
        sorted.sort((a, b) => b.row - a.row);
    } else if (dRow < 0) {
        // Moving Up: process top-most first (ascending row)
        sorted.sort((a, b) => a.row - b.row);
    }
    return sorted;
}

// Move blocks in a given direction vector
function move(dRow, dCol) {
    if (!isGameActive) return;

    // Save current state to history before moving
    const stateBeforeMove = blocks.map(b => ({ id: b.id, row: b.row, col: b.col }));
    
    // Get sorted blocks for movement order processing
    const sortedBlocks = getSortedBlocksForDirection(dRow, dCol);
    
    // Track new block coordinates to check for collision against newly occupied spaces
    const occupiedPositions = [];
    
    let anyMoved = false;

    sortedBlocks.forEach(block => {
        let currentRow = block.row;
        let currentCol = block.col;
        
        const nextRow = currentRow + dRow;
        const nextCol = currentCol + dCol;
        
        // Check if the single-step cell is within boundaries, not an obstacle, and not occupied
        const isValidMove = isWithinBoard(nextRow, nextCol) && 
                            !isObstacle(nextRow, nextCol) && 
                            !occupiedPositions.some(pos => pos.row === nextRow && pos.col === nextCol);
        
        if (isValidMove) {
            currentRow = nextRow;
            currentCol = nextCol;
        }
        
        // If position changed, mark as moved
        if (currentRow !== block.row || currentCol !== block.col) {
            anyMoved = true;
        }
        
        // Find the actual block in state and update its coordinates
        const stateBlock = blocks.find(b => b.id === block.id);
        stateBlock.row = currentRow;
        stateBlock.col = currentCol;
        
        // Save new occupied position
        occupiedPositions.push({ row: currentRow, col: currentCol });
    });

    if (anyMoved) {
        // Add past state to history
        history.push(stateBeforeMove);
        moves++;
        
        updateBlockPositions();
        updateStats();
        checkVictory();
    }
}

function checkVictory() {
    // Every target must be covered by a block
    const isVictory = activeTargets.every(target => 
        blocks.some(block => block.row === target.row && block.col === target.col)
    );

    if (isVictory) {
        isGameActive = false;
        setTimeout(() => {
            const victoryTextEl = document.getElementById('victory-text');
            if (victoryTextEl) {
                const styledMoves = `<span id="final-moves" style="color: #fbc531; font-weight: 800;">${moves}</span>`;
                victoryTextEl.innerHTML = t('victory_msg', { moves: styledMoves });
            } else {
                finalMovesEl.textContent = moves;
            }
            victoryModal.classList.add('show');
        }, 300); // Wait for sliding transition to finish
    }
}

// Undo the last move
function undo() {
    if (history.length === 0 || !isGameActive) return;
    
    const prevState = history.pop();
    prevState.forEach(saved => {
        const block = blocks.find(b => b.id === saved.id);
        if (block) {
            block.row = saved.row;
            block.col = saved.col;
        }
    });
    
    moves--;
    updateBlockPositions();
    updateStats();
}

// Reset game to initial state
function reset() {
    history = [];
    moves = 0;
    isGameActive = true;
    victoryModal.classList.remove('show');
    
    // Reset blocks to initial coordinates
    blocks.forEach((block, index) => {
        block.row = activeInitialBlocks[index].row;
        block.col = activeInitialBlocks[index].col;
    });
    
    updateBlockPositions();
    updateStats();
}

// Event Listeners: Keyboard Controls
window.addEventListener('keydown', (e) => {
    if (!isGameActive) return;
    
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            e.preventDefault();
            move(-1, 0);
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            e.preventDefault();
            move(1, 0);
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            e.preventDefault();
            move(0, -1);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            e.preventDefault();
            move(0, 1);
            break;
    }
});

// Event Listeners: Swipe Gestures for Mobile
window.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', (e) => {
    if (!isGameActive) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    if (Math.max(Math.abs(diffX), Math.abs(diffY)) < SWIPE_THRESHOLD) {
        return; // Swipe too short
    }
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > 0) {
            move(0, 1); // Swipe Right
        } else {
            move(0, -1); // Swipe Left
        }
    } else {
        // Vertical swipe
        if (diffY > 0) {
            move(1, 0); // Swipe Down
        } else {
            move(-1, 0); // Swipe Up
        }
    }
}, { passive: true });

// Button Controls
btnUndo.addEventListener('click', undo);
btnReset.addEventListener('click', reset);
btnPlayAgain.addEventListener('click', reset);

// Initialize Game
initBoard();
