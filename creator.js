// State variables
let boardSize = 9;
let activeTool = 'yellow'; // 'yellow', 'obstacle', 'target', 'eraser'

// Level components
let obstacles = [];
let targets = [];
let blocks = []; // Store blocks as {row, col}

// Mouse/Touch dragging states for painting
let isPainting = false;

// DOM Elements
const creatorBoardEl = document.getElementById('creator-board');
const sliderSize = document.getElementById('slider-size');
const sizeValEl = document.getElementById('size-val');
const countYellowEl = document.getElementById('count-yellow');
const countTargetEl = document.getElementById('count-target');
const btnClearAll = document.getElementById('btn-clear-all');
const btnTestLevel = document.getElementById('btn-test-level');
const btnShareLink = document.getElementById('btn-share-link');
const toolBtns = document.querySelectorAll('.tool-btn');

// Initialize board grid cells
function initEditorBoard() {
    creatorBoardEl.innerHTML = '';
    creatorBoardEl.style.setProperty('--board-size', boardSize);
    
    // Normalize lists in case size shrank and elements are outside boundaries
    obstacles = obstacles.filter(o => o.row < boardSize && o.col < boardSize);
    targets = targets.filter(t => t.row < boardSize && t.col < boardSize);
    blocks = blocks.filter(b => b.row < boardSize && b.col < boardSize);

    // Create grid cells
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            
            // Render current state elements
            if (obstacles.some(o => o.row === r && o.col === c)) {
                cell.classList.add('obstacle-cell');
            } else if (targets.some(t => t.row === r && t.col === c)) {
                cell.classList.add('target-cell');
            }
            
            // Mouse and touch draw actions
            cell.addEventListener('mousedown', (e) => {
                e.preventDefault();
                isPainting = true;
                paintCell(r, c, cell);
            });
            
            cell.addEventListener('mouseenter', () => {
                if (isPainting) {
                    paintCell(r, c, cell);
                }
            });
            
            creatorBoardEl.appendChild(cell);
        }
    }

    // Create and overlay yellow blocks
    renderYellowBlocks();
    updateStatsDisplay();
}

// Render absolutely-positioned yellow blocks on top of cells
function renderYellowBlocks() {
    // Remove old block elements
    const oldBlocks = creatorBoardEl.querySelectorAll('.block-yellow');
    oldBlocks.forEach(el => el.remove());

    // Render new block elements
    blocks.forEach((block, idx) => {
        const blockEl = document.createElement('div');
        blockEl.classList.add('block-yellow');
        blockEl.style.setProperty('--row', block.row);
        blockEl.style.setProperty('--col', block.col);
        creatorBoardEl.appendChild(blockEl);
    });
}

// Paint cell coordinate according to the selected tool
function paintCell(row, col, cellEl) {
    // Clear existing element at this coordinate to prevent overlap conflicts
    eraseAt(row, col);
    
    if (activeTool === 'yellow') {
        // Cannot paint block on targets or obstacles (handled by eraseAt)
        blocks.push({ row, col });
    } else if (activeTool === 'obstacle') {
        obstacles.push({ row, col });
        cellEl.classList.add('obstacle-cell');
    } else if (activeTool === 'target') {
        targets.push({ row, col });
        cellEl.classList.add('target-cell');
    } else if (activeTool === 'eraser') {
        // Already erased via eraseAt(row, col)
        cellEl.classList.remove('obstacle-cell', 'target-cell');
    }

    renderYellowBlocks();
    updateStatsDisplay();
}

// Helper: erase any element at a given coordinate
function eraseAt(row, col) {
    obstacles = obstacles.filter(o => !(o.row === row && o.col === col));
    targets = targets.filter(t => !(t.row === row && t.col === col));
    blocks = blocks.filter(b => !(b.row === row && b.col === col));
    
    // Update cell visuals directly if element exists
    const cells = creatorBoardEl.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        if (parseInt(cell.dataset.row) === row && parseInt(cell.dataset.col) === col) {
            cell.classList.remove('obstacle-cell', 'target-cell');
        }
    });
}

// Update stats count display
function updateStatsDisplay() {
    countYellowEl.textContent = blocks.length;
    countTargetEl.textContent = targets.length;
}

// Build shareable level data configuration
function generateLevelData() {
    return {
        size: boardSize,
        blocks: blocks.map(b => ({ row: b.row, col: b.col })),
        obstacles: obstacles.map(o => ({ row: o.row, col: o.col })),
        targets: targets.map(t => ({ row: t.row, col: t.col }))
    };
}

// Convert level config to base64 string
function encodeLevel(levelData) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(levelData))));
}

// Verify rules constraints: equal block and target counts, non-empty blocks
function validateLevel() {
    if (blocks.length === 0) {
        alert(t('alert_error_no_block'));
        return false;
    }
    if (targets.length === 0) {
        alert(t('alert_error_no_target'));
        return false;
    }
    if (blocks.length !== targets.length) {
        alert(t('alert_error_mismatch', { blocks: blocks.length, targets: targets.length }));
        return false;
    }
    return true;
}

// Click Handlers: Tool Buttons
toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        toolBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTool = btn.dataset.tool;
    });
});

// Click Handlers: Clear Board
btnClearAll.addEventListener('click', () => {
    if (confirm(t('alert_clear_confirm'))) {
        obstacles = [];
        targets = [];
        blocks = [];
        initEditorBoard();
    }
});

// Click Handlers: Size Slider
sliderSize.addEventListener('input', (e) => {
    boardSize = parseInt(e.target.value);
    sizeValEl.textContent = `${boardSize} x ${boardSize}`;
    initEditorBoard();
});

// Click Handlers: Test Custom Level
btnTestLevel.addEventListener('click', () => {
    if (!validateLevel()) return;
    
    const data = generateLevelData();
    const encoded = encodeLevel(data);
    
    // Open play page Index with custom query parameter
    window.location.href = `index.html?level=${encoded}`;
});

// Click Handlers: Copy share link
btnShareLink.addEventListener('click', () => {
    if (!validateLevel()) return;
    
    const data = generateLevelData();
    const encoded = encodeLevel(data);
    
    const playPageUrl = window.location.origin + window.location.pathname.replace('creator.html', 'index.html') + `?level=${encoded}&lang=${currentLang}`;
    
    // Copy URL to clipboard
    navigator.clipboard.writeText(playPageUrl)
        .then(() => {
            alert(t('alert_share_success'));
        })
        .catch(err => {
            console.error('Failed to copy share link:', err);
            // Fallback: show prompt in case navigator clipboard API is blocked
            prompt(t('alert_share_fallback'), playPageUrl);
        });
});

// Stop drawing when mouse is released anywhere
window.addEventListener('mouseup', () => {
    isPainting = false;
});

// Initialize Level Editor Grid
initEditorBoard();
