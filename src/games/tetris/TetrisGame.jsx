import { useEffect, useState } from 'react';
import { TETRIS_COLS, TETRIS_PREVIEW_SIZE, TETRIS_ROWS } from './tetrisConstants';
import {
  calculateLevel,
  calculateProcessingCount,
  clearCompletedLines,
  createEmptyTetrisBoard,
  createRandomPiece,
  getBoardWithPiece,
  getDropInterval,
  getSpawnPosition,
  hasCollision,
  mergePiece,
  rotateMatrix,
} from './tetrisLogic';

function renderEmptyCells(count, keyPrefix) {
  return Array.from({ length: count }, (_, index) => (
    <td key={`${keyPrefix}-${index}`} className="sheet-grid__cell" />
  ));
}

export default function TetrisGame({
  onBack,
  isPaused = false,
  isHidden = false,
}) {
  const [lockedBoard, setLockedBoard] = useState(() => createEmptyTetrisBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [nextPiece, setNextPiece] = useState(null);
  const [position, setPosition] = useState({ row: 0, col: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [clearedLines, setClearedLines] = useState(0);
  const [processingCount, setProcessingCount] = useState(0);
  const [flashRows, setFlashRows] = useState([]);
  const boardRows = Array.from({ length: TETRIS_ROWS }, (_, index) => index);
  const level = calculateLevel(clearedLines);
  const renderedBoard = getBoardWithPiece(lockedBoard, currentPiece, position);
  const hiddenClassName = isHidden ? 'sheet-hidden-row' : '';

  useEffect(() => {
    initializeBoard(false);
  }, []);

  useEffect(() => {
    if (!isRunning || isPaused || isGameOver || !currentPiece) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      dropPiece();
    }, getDropInterval(level));

    return () => {
      window.clearInterval(intervalId);
    };
  }, [currentPiece, isGameOver, isPaused, isRunning, level, lockedBoard, position]);

  useEffect(() => {
    function onKeyDown(event) {
      if (!currentPiece || isGameOver || isPaused || !isRunning) {
        if (event.code === 'Space' && !isGameOver) {
          event.preventDefault();
        }
        return;
      }

      if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Space'].includes(event.code)) {
        event.preventDefault();
      }

      if (event.code === 'ArrowLeft') {
        movePiece(-1);
      }

      if (event.code === 'ArrowRight') {
        movePiece(1);
      }

      if (event.code === 'ArrowDown') {
        dropPiece();
      }

      if (event.code === 'ArrowUp') {
        rotatePiece();
      }

      if (event.code === 'Space') {
        hardDropPiece();
      }
    }

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [currentPiece, isGameOver, isPaused, isRunning, lockedBoard, position]);

  function initializeBoard(shouldStartRunning) {
    const firstPiece = createRandomPiece();
    const upcomingPiece = createRandomPiece();
    const firstPosition = getSpawnPosition(firstPiece);

    setLockedBoard(createEmptyTetrisBoard());
    setCurrentPiece(firstPiece);
    setNextPiece(upcomingPiece);
    setPosition(firstPosition);
    setClearedLines(0);
    setProcessingCount(0);
    setFlashRows([]);
    setIsGameOver(false);
    setIsRunning(shouldStartRunning);
  }

  function spawnNextPiece(boardAfterLock) {
    const upcomingPiece = nextPiece ?? createRandomPiece();
    const followingPiece = createRandomPiece();
    const nextPosition = getSpawnPosition(upcomingPiece);

    if (hasCollision(boardAfterLock, upcomingPiece, nextPosition)) {
      setCurrentPiece(null);
      setNextPiece(followingPiece);
      setIsRunning(false);
      setIsGameOver(true);
      return;
    }

    setCurrentPiece(upcomingPiece);
    setPosition(nextPosition);
    setNextPiece(followingPiece);
  }

  function lockCurrentPiece(
    targetBoard = lockedBoard,
    targetPiece = currentPiece,
    targetPosition = position,
  ) {
    if (!targetPiece) {
      return;
    }

    const mergedBoard = mergePiece(targetBoard, targetPiece, targetPosition);
    const completedRows = mergedBoard.reduce((rows, row, rowIndex) => {
      if (row.every(Boolean)) {
        rows.push(rowIndex);
      }

      return rows;
    }, []);

    if (completedRows.length) {
      setFlashRows(completedRows);
      window.setTimeout(() => {
        setFlashRows([]);
      }, 130);
    }

    const { board: nextBoard, clearedLineCount } = clearCompletedLines(mergedBoard);
    setLockedBoard(nextBoard);

    if (clearedLineCount) {
      setClearedLines((currentLines) => currentLines + clearedLineCount);
      setProcessingCount((currentCount) =>
        currentCount + calculateProcessingCount(clearedLineCount),
      );
    }

    spawnNextPiece(nextBoard);
  }

  function movePiece(direction) {
    const nextPosition = {
      row: position.row,
      col: position.col + direction,
    };

    if (!hasCollision(lockedBoard, currentPiece, nextPosition)) {
      setPosition(nextPosition);
    }
  }

  function rotatePiece() {
    if (!currentPiece) {
      return;
    }

    const rotatedShape = rotateMatrix(currentPiece.shape);
    const rotatedPiece = {
      ...currentPiece,
      shape: rotatedShape,
    };
    const kickOffsets = [0, -1, 1, -2, 2];
    const validOffset = kickOffsets.find((offset) =>
      !hasCollision(lockedBoard, rotatedPiece, {
        row: position.row,
        col: position.col + offset,
      }),
    );

    if (validOffset === undefined) {
      return;
    }

    setCurrentPiece(rotatedPiece);
    setPosition((currentPosition) => ({
      row: currentPosition.row,
      col: currentPosition.col + validOffset,
    }));
  }

  function dropPiece() {
    if (!currentPiece) {
      return;
    }

    const nextPosition = {
      row: position.row + 1,
      col: position.col,
    };

    if (hasCollision(lockedBoard, currentPiece, nextPosition)) {
      lockCurrentPiece();
      return;
    }

    setPosition(nextPosition);
  }

  function hardDropPiece() {
    if (!currentPiece) {
      return;
    }

    let nextRow = position.row;

    while (
      !hasCollision(lockedBoard, currentPiece, {
        row: nextRow + 1,
        col: position.col,
      })
    ) {
      nextRow += 1;
    }

    const finalPosition = {
      row: nextRow,
      col: position.col,
    };

    setPosition(finalPosition);
    lockCurrentPiece(lockedBoard, currentPiece, finalPosition);
  }

  function handleStartOrRestart() {
    if (isGameOver) {
      initializeBoard(true);
      return;
    }

    if (!currentPiece) {
      initializeBoard(true);
      return;
    }

    setIsRunning(true);
  }

  function getStatusNote() {
    if (isGameOver) {
      return '정산 실패 상태가 감지되었습니다. 문서 복구를 진행하세요.';
    }

    if (isPaused && isRunning) {
      return '재고 정리 자동화 모듈 일시 중지됨';
    }

    if (isRunning) {
      return '재고 정리 자동화 모듈 실행 중';
    }

    return '재고 정리 자동화 모듈 대기 중';
  }

  function renderPreviewCells() {
    const previewMatrix = Array.from({ length: TETRIS_PREVIEW_SIZE }, () =>
      Array(TETRIS_PREVIEW_SIZE).fill(null),
    );

    if (nextPiece) {
      const startRow = Math.floor((TETRIS_PREVIEW_SIZE - nextPiece.shape.length) / 2);
      const startCol = Math.floor(
        (TETRIS_PREVIEW_SIZE - nextPiece.shape[0].length) / 2,
      );

      nextPiece.shape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell) {
            previewMatrix[startRow + rowIndex][startCol + colIndex] = nextPiece.color;
          }
        });
      });
    }

    return previewMatrix.flat().map((cellColor, index) => (
      <span
        key={`preview-${index}`}
        style={cellColor ? { '--tetris-cell-color': cellColor } : undefined}
        className={`tetris-side-panel__preview-cell${cellColor ? ' tetris-side-panel__preview-cell--filled' : ''}`}
      />
    ));
  }

  return (
    <>
      <tr className={hiddenClassName}>
        <th className="sheet-grid__row-header">1</th>
        <td colSpan={16} className="sheet-grid__cell tetris-sheet-note">
          {getStatusNote()}
        </td>
        <td colSpan={10} className="sheet-grid__cell tetris-sheet-back-cell">
          <button type="button" className="tetris-module__back-button" onClick={onBack}>
            업무 목록으로 돌아가기
          </button>
        </td>
      </tr>
      <tr className={hiddenClassName}>
        <th className="sheet-grid__row-header">2</th>
        <td colSpan={10} className="sheet-grid__cell tetris-sheet-title-cell">
          <div className="tetris-module__eyebrow">내부 처리 모듈</div>
          <div className="tetris-module__title">재고 정리 자동화</div>
        </td>
        <td className="sheet-grid__cell" />
        <td colSpan={4} className="sheet-grid__cell tetris-panel-heading-cell">
          <div className="tetris-side-panel__label">작업 현황</div>
        </td>
        {renderEmptyCells(11, 'title-filler')}
      </tr>
      {boardRows.map((boardRow) => (
        <tr key={`tetris-row-${boardRow}`} className={hiddenClassName}>
          <th className="sheet-grid__row-header">{boardRow + 3}</th>
          {Array.from({ length: TETRIS_COLS }, (_, colIndex) => {
            const cellColor = renderedBoard[boardRow][colIndex];
            const isFlashing = flashRows.includes(boardRow);

            return (
              <td
                key={`board-${boardRow}-${colIndex}`}
                className={`sheet-grid__cell tetris-grid-cell${cellColor ? ' tetris-grid-cell--filled' : ''}${isFlashing ? ' tetris-grid-cell--flash' : ''}`}
                style={cellColor ? { '--tetris-cell-color': cellColor } : undefined}
              >
                <div className="tetris-grid-cell__inner" />
              </td>
            );
          })}
          <td className="sheet-grid__cell tetris-grid-gap-cell" />
          {boardRow === 0 ? (
            <td rowSpan={TETRIS_ROWS} colSpan={4} className="sheet-grid__cell tetris-side-panel-cell">
              <aside className="tetris-side-panel">
                <div className="tetris-side-panel__section">
                  <div className="tetris-side-panel__label">업무명</div>
                  <div className="tetris-side-panel__value">재고 정리 자동화</div>
                </div>
                <div className="tetris-side-panel__section">
                  <div className="tetris-side-panel__label">처리 건수</div>
                  <div className="tetris-side-panel__value">{processingCount}</div>
                </div>
                <div className="tetris-side-panel__section">
                  <div className="tetris-side-panel__label">정리된 행</div>
                  <div className="tetris-side-panel__value">{clearedLines}</div>
                </div>
                <div className="tetris-side-panel__section">
                  <div className="tetris-side-panel__label">정산 단계</div>
                  <div className="tetris-side-panel__value">{level}</div>
                </div>
                <div className="tetris-side-panel__section">
                  <div className="tetris-side-panel__label">다음 데이터</div>
                  <div className="tetris-side-panel__preview">
                    <div className="tetris-side-panel__mini-grid">
                      {renderPreviewCells()}
                    </div>
                    <span>미리보기</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="tetris-side-panel__start-button"
                  onClick={handleStartOrRestart}
                >
                  {isGameOver ? '문서 복구' : isRunning ? '자동 정리 진행 중' : '자동 정리 시작'}
                </button>
                <div className={`tetris-side-panel__footnote${isGameOver ? ' tetris-side-panel__footnote--alert' : ''}`}>
                  {isGameOver ? '정산 실패' : '방향키로 위치 조정, Space로 즉시 반영'}
                </div>
              </aside>
            </td>
          ) : null}
          {renderEmptyCells(11, `row-filler-${boardRow}`)}
        </tr>
      ))}
    </>
  );
}
