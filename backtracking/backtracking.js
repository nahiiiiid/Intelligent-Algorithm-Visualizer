function createChessBoard(n) {
    const board = document.createElement('div');
    board.className = 'board';
    board.style.gridTemplateColumns = `repeat(${n}, 50px)`;

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const cell = document.createElement('div');
            cell.className = `cell ${(i + j) % 2 === 0 ? 'white' : 'black'}`;
            cell.id = `cell-${i}-${j}`;
            board.appendChild(cell);
        }
    }
    return board;
}

function createMazeBoard(rows, cols) {
    const board = document.createElement('div');
    board.className = 'board';
    board.style.gridTemplateColumns = `repeat(${cols}, 50px)`;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.className = `cell ${(i + j) % 2 === 0 ? 'white' : 'black'}`;
            cell.id = `maze-cell-${i}-${j}`;
            board.appendChild(cell);
        }
    }
    return board;
}

async function solveNQueens(board, row, n, steps) {
    if (row === n) return true;

    for (let col = 0; col < n; col++) {
        if (isSafe(board, row, col, n)) {
            board[row][col] = 1;
            document.getElementById(`cell-${row}-${col}`).textContent = 'Q';
            steps.push(`Placed Q at (${row}, ${col})`);
            await delay();

            if (await solveNQueens(board, row + 1, n, steps)) return true;

            board[row][col] = 0;
            document.getElementById(`cell-${row}-${col}`).textContent = '';
            steps.push(`Backtracked from (${row}, ${col})`);
            await delay();
        }
    }
    return false;
}

function isSafe(board, row, col, n) {
    for (let i = 0; i < row; i++) if (board[i][col]) return false;
    for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) if (board[i][j]) return false;
    for (let i = row, j = col; i >= 0 && j < n; i--, j++) if (board[i][j]) return false;
    return true;
}

async function startNQueens() {
    const n = 8; // Default board size
    const visualizer = document.getElementById('visualizer');
    visualizer.innerHTML = '';
    visualizer.appendChild(createChessBoard(n));

    const board = Array.from({ length: n }, () => Array(n).fill(0));
    const steps = [];

    document.getElementById('steps-log').textContent = '';
    if (!(await solveNQueens(board, 0, n, steps))) {
        steps.push('No solution found.');
    }
    document.getElementById('steps-log').textContent = steps.join('\n');
}

async function solveMaze(maze, x, y, solution, steps) {
    const rows = maze.length;
    const cols = maze[0].length;

    if (x === rows - 1 && y === cols - 1) {
        solution[x][y] = 1;
        document.getElementById(`maze-cell-${x}-${y}`).textContent = '*';
        steps.push(`Reached the end (${x}, ${y})`);
        return true;
    }

    if (isSafeMaze(maze, x, y)) {
        solution[x][y] = 1;
        document.getElementById(`maze-cell-${x}-${y}`).textContent = '*';
        steps.push(`Moved to (${x}, ${y})`);
        await delay();

        if (await solveMaze(maze, x + 1, y, solution, steps)) return true;
        if (await solveMaze(maze, x, y + 1, solution, steps)) return true;

        solution[x][y] = 0;
        document.getElementById(`maze-cell-${x}-${y}`).textContent = '';
        steps.push(`Backtracked from (${x}, ${y})`);
        await delay();
    }
    return false;
}

function isSafeMaze(maze, x, y) {
    return x >= 0 && y >= 0 && x < maze.length && y < maze[0].length && maze[x][y] === 1;
}

async function startMazeSolver() {
    const rows = 5;
    const cols = 5;
    const visualizer = document.getElementById('visualizer');
    visualizer.innerHTML = '';
    visualizer.appendChild(createMazeBoard(rows, cols));

    const maze = [
        [1, 0, 0, 0, 0],
        [1, 1, 0, 1, 0],
        [0, 1, 0, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 1, 1]
    ];

    const solution = Array.from({ length: rows }, () => Array(cols).fill(0));
    const steps = [];

    document.getElementById('steps-log').textContent = '';
    if (!(await solveMaze(maze, 0, 0, solution, steps))) {
        steps.push('No path found.');
    }
    document.getElementById('steps-log').textContent = steps.join('\n');
}

function delay() {
    return new Promise(resolve => setTimeout(resolve, 500));
}
