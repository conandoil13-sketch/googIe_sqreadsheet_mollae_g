import { useEffect, useMemo, useState } from 'react';

const BOARD_SIZE = 15;
const FIRST_APPROVAL = 'first';
const SECOND_APPROVAL = 'second';
const PANEL_ROW_SPAN = 15;
const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

function renderEmptyCells(count, keyPrefix) {
  return Array.from({ length: count }, (_, index) => (
    <td key={`${keyPrefix}-${index}`} className="sheet-grid__cell" />
  ));
}

function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

function isInsideBoard(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function countDirection(board, row, col, player, rowDelta, colDelta) {
  let count = 0;
  let nextRow = row + rowDelta;
  let nextCol = col + colDelta;

  while (isInsideBoard(nextRow, nextCol) && board[nextRow][nextCol] === player) {
    count += 1;
    nextRow += rowDelta;
    nextCol += colDelta;
  }

  return count;
}

function hasFiveInARow(board, row, col, player) {
  return DIRECTIONS.some(([rowDelta, colDelta]) => {
    const totalCount =
      1 +
      countDirection(board, row, col, player, rowDelta, colDelta) +
      countDirection(board, row, col, player, -rowDelta, -colDelta);

    return totalCount >= 5;
  });
}

function collectCandidateMoves(board) {
  const candidates = new Set();
  let hasStone = false;

  board.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (!value) {
        return;
      }

      hasStone = true;

      for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
        for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
          const nextRow = rowIndex + rowOffset;
          const nextCol = colIndex + colOffset;

          if (
            isInsideBoard(nextRow, nextCol) &&
            !board[nextRow][nextCol]
          ) {
            candidates.add(`${nextRow}-${nextCol}`);
          }
        }
      }
    });
  });

  if (!hasStone) {
    return [{ row: 7, col: 7 }];
  }

  return Array.from(candidates).map((entry) => {
    const [row, col] = entry.split('-').map(Number);
    return { row, col };
  });
}

function findCriticalMove(board, player) {
  const candidates = collectCandidateMoves(board);

  return (
    candidates.find(({ row, col }) => {
      const nextBoard = board.map((currentRow) => [...currentRow]);
      nextBoard[row][col] = player;
      return hasFiveInARow(nextBoard, row, col, player);
    }) ?? null
  );
}

function scoreMove(board, row, col, player) {
  const centerDistance =
    Math.abs(row - Math.floor(BOARD_SIZE / 2)) +
    Math.abs(col - Math.floor(BOARD_SIZE / 2));
  let neighborCount = 0;

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
      if (!rowOffset && !colOffset) {
        continue;
      }

      const nextRow = row + rowOffset;
      const nextCol = col + colOffset;

      if (isInsideBoard(nextRow, nextCol) && board[nextRow][nextCol] === player) {
        neighborCount += 1;
      }
    }
  }

  return neighborCount * 10 - centerDistance;
}

function chooseBotMove(board) {
  const winningMove = findCriticalMove(board, SECOND_APPROVAL);
  if (winningMove) {
    return winningMove;
  }

  const blockingMove = findCriticalMove(board, FIRST_APPROVAL);
  if (blockingMove) {
    return blockingMove;
  }

  const candidates = collectCandidateMoves(board);

  return candidates.sort(
    (left, right) =>
      scoreMove(board, right.row, right.col, SECOND_APPROVAL) -
      scoreMove(board, left.row, left.col, SECOND_APPROVAL),
  )[0];
}

export default function OmokGame({ onBack, isHidden = false }) {
  const [board, setBoard] = useState(() => createEmptyBoard());
  const [currentTurn, setCurrentTurn] = useState(FIRST_APPROVAL);
  const [status, setStatus] = useState('playing');
  const [winner, setWinner] = useState(null);
  const hiddenClassName = isHidden ? 'sheet-hidden-row' : '';

  const placedCount = useMemo(
    () => board.flat().filter(Boolean).length,
    [board],
  );

  function restartBoard() {
    setBoard(createEmptyBoard());
    setCurrentTurn(FIRST_APPROVAL);
    setStatus('playing');
    setWinner(null);
  }

  function placeApproval(row, col, player) {
    if (board[row][col] || status !== 'playing') {
      return false;
    }

    const nextBoard = board.map((currentRow) => [...currentRow]);
    nextBoard[row][col] = player;
    setBoard(nextBoard);

    if (hasFiveInARow(nextBoard, row, col, player)) {
      setStatus('won');
      setWinner(player);
      return true;
    }

    setCurrentTurn(player === FIRST_APPROVAL ? SECOND_APPROVAL : FIRST_APPROVAL);
    return true;
  }

  function handleCellClick(row, col) {
    if (currentTurn !== FIRST_APPROVAL || status !== 'playing') {
      return;
    }

    placeApproval(row, col, FIRST_APPROVAL);
  }

  useEffect(() => {
    if (currentTurn !== SECOND_APPROVAL || status !== 'playing') {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      const botMove = chooseBotMove(board);

      if (!botMove) {
        return;
      }

      placeApproval(botMove.row, botMove.col, SECOND_APPROVAL);
    }, 220);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [board, currentTurn, status]);

  function getCurrentOwnerText() {
    return currentTurn === FIRST_APPROVAL ? '1차 결재' : '2차 결재';
  }

  function getStatusText() {
    if (status === 'won') {
      return '결재선 완성';
    }

    return '결재선 진행 중';
  }

  function getWinnerText() {
    if (winner === FIRST_APPROVAL || winner === SECOND_APPROVAL) {
      return '결재선이 완성되었습니다.';
    }

    return '같은 표시가 5개 연속되면 완료됩니다.';
  }

  return (
    <>
      <tr className={hiddenClassName}>
        <th className="sheet-grid__row-header">1</th>
        <td colSpan={16} className="sheet-grid__cell omok-note-cell">
          결재선 배치 모듈 실행 중
        </td>
        <td colSpan={10} className="sheet-grid__cell omok-back-cell">
          <button type="button" className="tetris-module__back-button" onClick={onBack}>
            업무 목록으로 돌아가기
          </button>
        </td>
      </tr>
      <tr className={hiddenClassName}>
        <th className="sheet-grid__row-header">2</th>
        <td colSpan={10} className="sheet-grid__cell omok-title-cell">
          <div className="tetris-module__eyebrow">내부 결재 모듈</div>
          <div className="tetris-module__title">결재선 배치</div>
        </td>
        <td className="sheet-grid__cell" />
        <td colSpan={4} className="sheet-grid__cell omok-panel-heading-cell">
          <div className="tetris-side-panel__label">작업 현황</div>
        </td>
        {renderEmptyCells(11, 'omok-header')}
      </tr>
      {Array.from({ length: PANEL_ROW_SPAN }, (_, rowIndex) => (
        <tr key={`omok-row-${rowIndex}`} className={hiddenClassName}>
          <th className="sheet-grid__row-header">{rowIndex + 3}</th>
          {rowIndex < BOARD_SIZE
            ? board[rowIndex].map((value, colIndex) => (
                <td
                  key={`omok-${rowIndex}-${colIndex}`}
                  className={`sheet-grid__cell omok-cell${value ? ' omok-cell--filled' : ''}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  <div className={`omok-cell__inner${value ? ` omok-cell__inner--${value}` : ''}`}>
                    {value === FIRST_APPROVAL ? '●' : value === SECOND_APPROVAL ? '○' : ''}
                  </div>
                </td>
              ))
            : Array.from({ length: BOARD_SIZE }, (_, colIndex) => (
                <td
                  key={`omok-empty-${rowIndex}-${colIndex}`}
                  className="sheet-grid__cell omok-empty-cell"
                />
              ))}
          <td className="sheet-grid__cell omok-gap-cell" />
          {rowIndex === 0 ? (
            <td rowSpan={PANEL_ROW_SPAN} colSpan={4} className="sheet-grid__cell omok-side-panel-cell">
              <aside className="omok-side-panel">
                <div className="tetris-side-panel__section">
                  <div className="tetris-side-panel__label">현재 담당</div>
                  <div className="tetris-side-panel__value">{getCurrentOwnerText()}</div>
                </div>
                <div className="tetris-side-panel__section">
                  <div className="tetris-side-panel__label">진행 상태</div>
                  <div className="tetris-side-panel__value">{getStatusText()}</div>
                </div>
                <div className="tetris-side-panel__section">
                  <div className="tetris-side-panel__label">완료 여부</div>
                  <div className="tetris-side-panel__value">{status === 'won' ? '완료' : '진행 중'}</div>
                </div>
                <div className="tetris-side-panel__section">
                  <div className="tetris-side-panel__label">배치 수</div>
                  <div className="tetris-side-panel__value">{placedCount}</div>
                </div>
                <div className="tetris-side-panel__section">
                  <div className="tetris-side-panel__label">안내</div>
                  <div className="omok-side-panel__description">
                    1차 결재를 두면 2차 결재가 이어서 배치됩니다. 같은 표시가 5개 연속되면 완료됩니다.
                  </div>
                </div>
                <button
                  type="button"
                  className="tetris-side-panel__start-button"
                  onClick={restartBoard}
                >
                  결재선 초기화
                </button>
                <div className="tetris-side-panel__footnote">
                  {getWinnerText()}
                </div>
              </aside>
            </td>
          ) : null}
          {renderEmptyCells(10, `omok-filler-${rowIndex}`)}
        </tr>
      ))}
    </>
  );
}
