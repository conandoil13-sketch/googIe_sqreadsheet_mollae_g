import {
  TETRIS_BASE_DROP_INTERVAL,
  TETRIS_COLS,
  TETRIS_LEVEL_STEP,
  TETRIS_LINES_PER_LEVEL,
  TETRIS_MIN_DROP_INTERVAL,
  TETRIS_ROWS,
  TETROMINOES,
  TETROMINO_TYPES,
} from './tetrisConstants';

export function createEmptyTetrisBoard(rows = TETRIS_ROWS, cols = TETRIS_COLS) {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

export function createPiece(type) {
  const tetromino = TETROMINOES[type];

  return {
    type,
    color: tetromino.color,
    shape: tetromino.shape.map((row) => [...row]),
  };
}

export function createRandomPiece() {
  const randomType =
    TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];

  return createPiece(randomType);
}

export function getSpawnPosition(piece) {
  return {
    row: 0,
    col: Math.floor((TETRIS_COLS - piece.shape[0].length) / 2),
  };
}

export function rotateMatrix(shape) {
  return shape[0].map((_, colIndex) =>
    shape.map((row) => row[colIndex]).reverse(),
  );
}

export function hasCollision(board, piece, position) {
  return piece.shape.some((row, rowIndex) =>
    row.some((cell, colIndex) => {
      if (!cell) {
        return false;
      }

      const boardRow = position.row + rowIndex;
      const boardCol = position.col + colIndex;

      if (boardCol < 0 || boardCol >= TETRIS_COLS || boardRow >= TETRIS_ROWS) {
        return true;
      }

      if (boardRow < 0) {
        return false;
      }

      return Boolean(board[boardRow][boardCol]);
    }),
  );
}

export function mergePiece(board, piece, position) {
  const nextBoard = board.map((row) => [...row]);

  piece.shape.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (!cell) {
        return;
      }

      const boardRow = position.row + rowIndex;
      const boardCol = position.col + colIndex;

      if (boardRow >= 0) {
        nextBoard[boardRow][boardCol] = piece.color;
      }
    });
  });

  return nextBoard;
}

export function clearCompletedLines(board) {
  const remainingRows = board.filter((row) => row.some((cell) => !cell));
  const clearedLineCount = board.length - remainingRows.length;

  if (!clearedLineCount) {
    return {
      board,
      clearedLineCount: 0,
    };
  }

  const nextBoard = [
    ...Array.from({ length: clearedLineCount }, () => Array(TETRIS_COLS).fill(null)),
    ...remainingRows,
  ];

  return {
    board: nextBoard,
    clearedLineCount,
  };
}

export function getBoardWithPiece(board, piece, position) {
  if (!piece) {
    return board;
  }

  const nextBoard = board.map((row) => [...row]);

  piece.shape.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (!cell) {
        return;
      }

      const boardRow = position.row + rowIndex;
      const boardCol = position.col + colIndex;

      if (
        boardRow >= 0 &&
        boardRow < TETRIS_ROWS &&
        boardCol >= 0 &&
        boardCol < TETRIS_COLS
      ) {
        nextBoard[boardRow][boardCol] = piece.color;
      }
    });
  });

  return nextBoard;
}

export function calculateProcessingCount(lineCount) {
  return lineCount * 100;
}

export function calculateLevel(lineCount) {
  return Math.floor(lineCount / TETRIS_LINES_PER_LEVEL) + 1;
}

export function getDropInterval(level) {
  return Math.max(
    TETRIS_MIN_DROP_INTERVAL,
    TETRIS_BASE_DROP_INTERVAL - (level - 1) * TETRIS_LEVEL_STEP,
  );
}
