import { useEffect, useMemo, useState } from 'react';

const BOARD_SIZE = 4;
const STARTING_TILES = 2;
const PANEL_ROW_SPAN = 8;

const TILE_COLORS = {
  2: '#f3f4f6',
  4: '#ecefe7',
  8: '#e3eadb',
  16: '#d9e5d1',
  32: '#d4e0ca',
  64: '#c9d8be',
  128: '#bfd0b5',
  256: '#b4c7a9',
  512: '#acbf9f',
  1024: '#a3b695',
  2048: '#9aae8b',
};

function renderEmptyCells(count, keyPrefix) {
  return Array.from({ length: count }, (_, index) => (
    <td key={`${keyPrefix}-${index}`} className="sheet-grid__cell" />
  ));
}

function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}

function getRandomEmptyCell(board) {
  const emptyCells = [];

  board.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (value === 0) {
        emptyCells.push({ row: rowIndex, col: colIndex });
      }
    });
  });

  if (!emptyCells.length) {
    return null;
  }

  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function addRandomTile(board) {
  const target = getRandomEmptyCell(board);

  if (!target) {
    return board;
  }

  const nextBoard = board.map((row) => [...row]);
  nextBoard[target.row][target.col] = Math.random() < 0.9 ? 2 : 4;
  return nextBoard;
}

function createInitialBoard() {
  let board = createEmptyBoard();

  for (let index = 0; index < STARTING_TILES; index += 1) {
    board = addRandomTile(board);
  }

  return board;
}

function slideAndMergeLine(line) {
  const values = line.filter((value) => value !== 0);
  const merged = [];
  let gainedScore = 0;

  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === values[index + 1]) {
      const mergedValue = values[index] * 2;
      merged.push(mergedValue);
      gainedScore += mergedValue;
      index += 1;
    } else {
      merged.push(values[index]);
    }
  }

  while (merged.length < BOARD_SIZE) {
    merged.push(0);
  }

  return {
    line: merged,
    gainedScore,
    moved: merged.some((value, index) => value !== line[index]),
  };
}

function transpose(board) {
  return board[0].map((_, colIndex) => board.map((row) => row[colIndex]));
}

function reverseRows(board) {
  return board.map((row) => [...row].reverse());
}

function moveBoard(board, direction) {
  let workingBoard = board.map((row) => [...row]);

  if (direction === 'up' || direction === 'down') {
    workingBoard = transpose(workingBoard);
  }

  if (direction === 'right' || direction === 'down') {
    workingBoard = reverseRows(workingBoard);
  }

  let moved = false;
  let gainedScore = 0;

  workingBoard = workingBoard.map((line) => {
    const result = slideAndMergeLine(line);
    if (result.moved) {
      moved = true;
    }
    gainedScore += result.gainedScore;
    return result.line;
  });

  if (direction === 'right' || direction === 'down') {
    workingBoard = reverseRows(workingBoard);
  }

  if (direction === 'up' || direction === 'down') {
    workingBoard = transpose(workingBoard);
  }

  return {
    board: workingBoard,
    moved,
    gainedScore,
  };
}

function hasAvailableMoves(board) {
  if (board.some((row) => row.includes(0))) {
    return true;
  }

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const value = board[row][col];
      if (value === board[row][col + 1] || value === board[row + 1]?.[col]) {
        return true;
      }
    }
  }

  return false;
}

export default function Game2048({ onBack, isHidden = false }) {
  const [board, setBoard] = useState(() => createInitialBoard());
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState('playing');
  const hiddenClassName = isHidden ? 'sheet-hidden-row' : '';

  const maxTile = useMemo(() => Math.max(...board.flat()), [board]);

  function restartBoard() {
    setBoard(createInitialBoard());
    setScore(0);
    setStatus('playing');
  }

  function applyMove(direction) {
    if (status !== 'playing') {
      return;
    }

    const result = moveBoard(board, direction);

    if (!result.moved) {
      return;
    }

    const nextBoard = addRandomTile(result.board);
    const nextScore = score + result.gainedScore;
    const nextMaxTile = Math.max(...nextBoard.flat());

    setBoard(nextBoard);
    setScore(nextScore);

    if (nextMaxTile >= 2048) {
      setStatus('won');
      return;
    }

    if (!hasAvailableMoves(nextBoard)) {
      setStatus('lost');
    }
  }

  useEffect(() => {
    function onKeyDown(event) {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        return;
      }

      event.preventDefault();

      if (event.key === 'ArrowLeft') {
        applyMove('left');
      }

      if (event.key === 'ArrowRight') {
        applyMove('right');
      }

      if (event.key === 'ArrowUp') {
        applyMove('up');
      }

      if (event.key === 'ArrowDown') {
        applyMove('down');
      }
    }

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [board, score, status]);

  function getStatusText() {
    if (status === 'won') {
      return '결산 완료';
    }

    if (status === 'lost') {
      return '계산 실패';
    }

    return '자동 합산 진행 중';
  }

  function getFootnoteText() {
    if (status === 'won') {
      return '2048 도달로 결산이 완료되었습니다.';
    }

    if (status === 'lost') {
      return '더 이상 정렬 가능한 셀이 없습니다.';
    }

    return '방향키로 정렬하면 같은 수치가 자동 합산됩니다.';
  }

  return (
    <>
      <tr className={hiddenClassName}>
        <th className="sheet-grid__row-header">1</th>
        <td colSpan={16} className="sheet-grid__cell sum2048-note-cell">
          자동 합산 테스트 모듈 실행 중
        </td>
        <td colSpan={10} className="sheet-grid__cell sum2048-back-cell">
          <button type="button" className="tetris-module__back-button" onClick={onBack}>
            업무 목록으로 돌아가기
          </button>
        </td>
      </tr>
      <tr className={hiddenClassName}>
        <th className="sheet-grid__row-header">2</th>
        <td colSpan={8} className="sheet-grid__cell sum2048-title-cell">
          <div className="tetris-module__eyebrow">내부 계산 모듈</div>
          <div className="tetris-module__title">자동 합산 테스트</div>
        </td>
        <td className="sheet-grid__cell" />
        <td colSpan={4} className="sheet-grid__cell sum2048-panel-heading-cell">
          <div className="tetris-side-panel__label">작업 현황</div>
        </td>
        {renderEmptyCells(13, 'sum2048-header')}
      </tr>
      {Array.from({ length: PANEL_ROW_SPAN }, (_, rowIndex) => (
        <tr key={`sum2048-row-${rowIndex}`} className={hiddenClassName}>
          <th className="sheet-grid__row-header">{rowIndex + 3}</th>
          {rowIndex < BOARD_SIZE
            ? board[rowIndex].map((value, colIndex) => (
                <td
                  key={`sum2048-${rowIndex}-${colIndex}`}
                  className={`sheet-grid__cell sum2048-cell${value ? ' sum2048-cell--filled' : ''}`}
                  style={
                    value
                      ? {
                          '--sum2048-cell-color':
                            TILE_COLORS[value] ?? TILE_COLORS[2048],
                        }
                      : undefined
                  }
                >
                  <div className="sum2048-cell__inner">{value || ''}</div>
                </td>
              ))
            : Array.from({ length: BOARD_SIZE }, (_, colIndex) => (
                <td
                  key={`sum2048-empty-${rowIndex}-${colIndex}`}
                  className="sheet-grid__cell sum2048-empty-cell"
                />
              ))}
          <td className="sheet-grid__cell sum2048-gap-cell" />
          {rowIndex === 0 ? (
            <td rowSpan={PANEL_ROW_SPAN} colSpan={4} className="sheet-grid__cell sum2048-side-panel-cell">
              <aside className="sum2048-side-panel">
                <div className="tetris-side-panel__section">
                  <div className="tetris-side-panel__label">업무명</div>
                  <div className="tetris-side-panel__value">자동 합산 테스트</div>
                </div>
                <div className="tetris-side-panel__section">
                  <div className="tetris-side-panel__label">누적 합계</div>
                  <div className="tetris-side-panel__value">{score}</div>
                </div>
                <div className="tetris-side-panel__section">
                  <div className="tetris-side-panel__label">최대값</div>
                  <div className="tetris-side-panel__value">{maxTile}</div>
                </div>
                <div className="tetris-side-panel__section">
                  <div className="tetris-side-panel__label">계산 상태</div>
                  <div className="tetris-side-panel__value">{getStatusText()}</div>
                </div>
                <div className="tetris-side-panel__section">
                  <div className="tetris-side-panel__label">안내</div>
                  <div className="sum2048-side-panel__description">
                    방향키로 셀을 정렬하면 같은 수치가 자동 합산됩니다.
                  </div>
                </div>
                <button
                  type="button"
                  className="tetris-side-panel__start-button"
                  onClick={restartBoard}
                >
                  수식 초기화
                </button>
                <div className={`tetris-side-panel__footnote${status === 'lost' ? ' tetris-side-panel__footnote--alert' : ''}`}>
                  {getFootnoteText()}
                </div>
              </aside>
            </td>
          ) : null}
          {renderEmptyCells(17, `sum2048-filler-${rowIndex}`)}
        </tr>
      ))}
    </>
  );
}
