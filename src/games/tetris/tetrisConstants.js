export const TETRIS_ROWS = 20;
export const TETRIS_COLS = 10;
export const TETRIS_BASE_DROP_INTERVAL = 720;
export const TETRIS_MIN_DROP_INTERVAL = 140;
export const TETRIS_LEVEL_STEP = 55;
export const TETRIS_LINES_PER_LEVEL = 4;
export const TETRIS_PREVIEW_SIZE = 4;

export const TETROMINOES = {
  I: {
    color: '#9ea4aa',
    shape: [[1, 1, 1, 1]],
  },
  O: {
    color: '#b1a28f',
    shape: [
      [1, 1],
      [1, 1],
    ],
  },
  T: {
    color: '#95a296',
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
  },
  S: {
    color: '#a8afa3',
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
  },
  Z: {
    color: '#b3a0a0',
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
  },
  J: {
    color: '#8fa0ad',
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
  },
  L: {
    color: '#b39b86',
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
  },
};

export const TETROMINO_TYPES = Object.keys(TETROMINOES);
