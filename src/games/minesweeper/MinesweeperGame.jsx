import { useMemo, useState } from 'react';

const MINE_COLS = 12;
const MINE_ROWS = 12;
const MINE_COUNT = 18;

function renderEmptyCells(count, keyPrefix) {
  return Array.from({ length: count }, (_, index) => (
    <td key={`${keyPrefix}-${index}`} className="sheet-grid__cell" />
  ));
}

function createBoard() {
  return Array.from({ length: MINE_ROWS }, (_, row) =>
    Array.from({ length: MINE_COLS }, (_, col) => ({
      id: `${row}-${col}`,
      row,
      col,
      hasMine: false,
      isOpen: false,
      isFlagged: false,
      adjacentCount: 0,
    })),
  );
}

function getNeighborPositions(row, col) {
  const neighbors = [];

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
      if (rowOffset === 0 && colOffset === 0) {
        continue;
      }

      const nextRow = row + rowOffset;
      const nextCol = col + colOffset;

      if (
        nextRow >= 0 &&
        nextRow < MINE_ROWS &&
        nextCol >= 0 &&
        nextCol < MINE_COLS
      ) {
        neighbors.push({ row: nextRow, col: nextCol });
      }
    }
  }

  return neighbors;
}

function seedBoard() {
  const board = createBoard();
  let placedMineCount = 0;

  while (placedMineCount < MINE_COUNT) {
    const row = Math.floor(Math.random() * MINE_ROWS);
    const col = Math.floor(Math.random() * MINE_COLS);

    if (board[row][col].hasMine) {
      continue;
    }

    board[row][col].hasMine = true;
    placedMineCount += 1;
  }

  return board.map((row) =>
    row.map((cell) => ({
      ...cell,
      adjacentCount: getNeighborPositions(cell.row, cell.col).filter(
        ({ row: neighborRow, col: neighborCol }) =>
          board[neighborRow][neighborCol].hasMine,
      ).length,
    })),
  );
}

function revealConnectedCells(board, startRow, startCol) {
  const nextBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  const queue = [{ row: startRow, col: startCol }];

  while (queue.length) {
    const current = queue.shift();
    const cell = nextBoard[current.row][current.col];

    if (cell.isOpen || cell.isFlagged) {
      continue;
    }

    cell.isOpen = true;

    if (cell.adjacentCount !== 0 || cell.hasMine) {
      continue;
    }

    getNeighborPositions(current.row, current.col).forEach((neighbor) => {
      const neighborCell = nextBoard[neighbor.row][neighbor.col];

      if (!neighborCell.isOpen && !neighborCell.hasMine && !neighborCell.isFlagged) {
        queue.push(neighbor);
      }
    });
  }

  return nextBoard;
}

function revealAllMines(board) {
  return board.map((row) =>
    row.map((cell) =>
      cell.hasMine
        ? {
            ...cell,
            isOpen: true,
          }
        : cell,
    ),
  );
}

function countOpenedSafeCells(board) {
  return board.flat().filter((cell) => cell.isOpen && !cell.hasMine).length;
}

export default function MinesweeperGame({ onBack, isHidden = false }) {
  const [board, setBoard] = useState(() => seedBoard());
  const [status, setStatus] = useState('playing');
  const hiddenClassName = isHidden ? 'sheet-hidden-row' : '';
  const totalSafeCellCount = MINE_ROWS * MINE_COLS - MINE_COUNT;

  const flaggedCount = useMemo(
    () => board.flat().filter((cell) => cell.isFlagged).length,
    [board],
  );
  const openedSafeCount = useMemo(() => countOpenedSafeCells(board), [board]);

  function restartReview() {
    setBoard(seedBoard());
    setStatus('playing');
  }

  function markReviewCell(event, rowIndex, colIndex) {
    event.preventDefault();

    if (status !== 'playing') {
      return;
    }

    setBoard((currentBoard) =>
      currentBoard.map((row, currentRowIndex) =>
        row.map((cell, currentColIndex) => {
          if (currentRowIndex !== rowIndex || currentColIndex !== colIndex || cell.isOpen) {
            return cell;
          }

          return {
            ...cell,
            isFlagged: !cell.isFlagged,
          };
        }),
      ),
    );
  }

  function openCell(rowIndex, colIndex) {
    if (status !== 'playing') {
      return;
    }

    const targetCell = board[rowIndex][colIndex];

    if (targetCell.isOpen || targetCell.isFlagged) {
      return;
    }

    if (targetCell.hasMine) {
      setBoard((currentBoard) => revealAllMines(currentBoard));
      setStatus('lost');
      return;
    }

    const nextBoard = revealConnectedCells(board, rowIndex, colIndex);
    const safeCellCount = countOpenedSafeCells(nextBoard);

    setBoard(nextBoard);

    if (safeCellCount === totalSafeCellCount) {
      setStatus('won');
    }
  }

  function handleCellClick(event, rowIndex, colIndex) {
    if (event.shiftKey) {
      markReviewCell(event, rowIndex, colIndex);
      return;
    }

    openCell(rowIndex, colIndex);
  }

  function getStatusText() {
    if (status === 'lost') {
      return '문서 손상';
    }

    if (status === 'won') {
      return '검토 완료';
    }

    return '검토 진행 중';
  }

  function getFootnoteText() {
    if (status === 'lost') {
      return '손상 데이터가 열려 검토가 중단되었습니다.';
    }

    if (status === 'won') {
      return '모든 안전 셀 검토가 완료되었습니다.';
    }

    return '우클릭 또는 Shift + 클릭으로 검토 필요 표시';
  }

  return (
    <>
      <tr className={hiddenClassName}>
        <th className="sheet-grid__row-header">1</th>
        <td colSpan={16} className="sheet-grid__cell mines-note-cell">
          오류 셀 검토 모듈 실행 중
        </td>
        <td colSpan={10} className="sheet-grid__cell mines-back-cell">
          <button type="button" className="tetris-module__back-button" onClick={onBack}>
            업무 목록으로 돌아가기
          </button>
        </td>
      </tr>
      <tr className={hiddenClassName}>
        <th className="sheet-grid__row-header">2</th>
        <td colSpan={12} className="sheet-grid__cell mines-title-cell">
          <div className="tetris-module__eyebrow">내부 검토 모듈</div>
          <div className="tetris-module__title">오류 셀 검토</div>
        </td>
        <td className="sheet-grid__cell" />
        <td colSpan={4} className="sheet-grid__cell mines-panel-heading-cell">
          <div className="tetris-side-panel__label">작업 현황</div>
        </td>
        {renderEmptyCells(9, 'mines-header')}
      </tr>
      {board.map((row, rowIndex) => (
        <tr key={`mines-row-${rowIndex}`} className={hiddenClassName}>
          <th className="sheet-grid__row-header">{rowIndex + 3}</th>
          {row.map((cell) => {
            const shouldRevealMine = status === 'lost' && cell.hasMine;
            const displayValue =
              cell.isFlagged
                ? '검토'
                : cell.isOpen && cell.adjacentCount > 0
                  ? cell.adjacentCount
                  : '';

            return (
              <td
                key={cell.id}
                className={`sheet-grid__cell mines-cell${cell.isOpen ? ' mines-cell--open' : ''}${shouldRevealMine ? ' mines-cell--mine' : ''}${cell.isFlagged ? ' mines-cell--flagged' : ''}`}
                onClick={(event) => handleCellClick(event, rowIndex, cell.col)}
                onContextMenu={(event) => markReviewCell(event, rowIndex, cell.col)}
              >
                <div className="mines-cell__inner">{displayValue}</div>
              </td>
            );
          })}
          <td className="sheet-grid__cell mines-gap-cell" />
          {rowIndex === 0 ? (
            <td rowSpan={MINE_ROWS} colSpan={4} className="sheet-grid__cell mines-side-panel-cell">
              <aside className="mines-side-panel">
                <div className="tetris-side-panel__section">
                  <div className="tetris-side-panel__label">업무명</div>
                  <div className="tetris-side-panel__value">오류 셀 검토</div>
                </div>
                <div className="tetris-side-panel__section">
                  <div className="tetris-side-panel__label">검토 상태</div>
                  <div className="tetris-side-panel__value">{getStatusText()}</div>
                </div>
                <div className="tetris-side-panel__section">
                  <div className="tetris-side-panel__label">열린 셀</div>
                  <div className="tetris-side-panel__value">{openedSafeCount}</div>
                </div>
                <div className="tetris-side-panel__section">
                  <div className="tetris-side-panel__label">검토 필요</div>
                  <div className="tetris-side-panel__value">{flaggedCount}</div>
                </div>
                <div className="tetris-side-panel__section">
                  <div className="tetris-side-panel__label">안내</div>
                  <div className="mines-side-panel__description">
                    주변 숫자를 참고해 손상 데이터를 피해 안전 셀을 모두 검토합니다.
                  </div>
                </div>
                <button
                  type="button"
                  className="tetris-side-panel__start-button"
                  onClick={restartReview}
                >
                  다시 검토
                </button>
                <div className={`tetris-side-panel__footnote${status === 'lost' ? ' tetris-side-panel__footnote--alert' : ''}`}>
                  {getFootnoteText()}
                </div>
              </aside>
            </td>
          ) : null}
          {renderEmptyCells(9, `mines-filler-${rowIndex}`)}
        </tr>
      ))}
    </>
  );
}
