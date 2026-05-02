import { useMemo, useState } from 'react';

const PUZZLE = [
  [0, 1, 1, 1, 0],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [0, 1, 1, 1, 0],
  [0, 0, 1, 0, 0],
];

const GRID_SIZE = PUZZLE.length;
const PANEL_ROW_SPAN = 8;

function createEmptyMarks() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill('empty'));
}

function renderEmptyCells(count, keyPrefix) {
  return Array.from({ length: count }, (_, index) => (
    <td key={`${keyPrefix}-${index}`} className="sheet-grid__cell" />
  ));
}

function buildHints(lines) {
  return lines.map((line) => {
    const hints = [];
    let count = 0;

    line.forEach((value) => {
      if (value) {
        count += 1;
      } else if (count) {
        hints.push(count);
        count = 0;
      }
    });

    if (count) {
      hints.push(count);
    }

    return hints.length ? hints : [0];
  });
}

function transpose(grid) {
  return grid[0].map((_, colIndex) => grid.map((row) => row[colIndex]));
}

export default function NonogramGame({ onBack, isHidden = false }) {
  const [marks, setMarks] = useState(() => createEmptyMarks());
  const hiddenClassName = isHidden ? 'sheet-hidden-row' : '';

  const rowHints = useMemo(() => buildHints(PUZZLE), []);
  const columnHints = useMemo(() => buildHints(transpose(PUZZLE)), []);

  const filledCount = useMemo(
    () => marks.flat().filter((cell) => cell === 'filled').length,
    [marks],
  );

  const mistakeCount = useMemo(
    () =>
      marks.reduce(
        (total, row, rowIndex) =>
          total +
          row.reduce((rowTotal, cell, colIndex) => {
            if (cell === 'filled' && PUZZLE[rowIndex][colIndex] !== 1) {
              return rowTotal + 1;
            }
            return rowTotal;
          }, 0),
        0,
      ),
    [marks],
  );

  const isComplete = useMemo(
    () =>
      marks.every((row, rowIndex) =>
        row.every((cell, colIndex) => {
          if (PUZZLE[rowIndex][colIndex] === 1) {
            return cell === 'filled';
          }
          return cell !== 'filled';
        }),
      ),
    [marks],
  );

  function restartAudit() {
    setMarks(createEmptyMarks());
  }

  function updateCell(rowIndex, colIndex, nextValue) {
    setMarks((currentMarks) =>
      currentMarks.map((row, currentRowIndex) =>
        row.map((cell, currentColIndex) => {
          if (currentRowIndex !== rowIndex || currentColIndex !== colIndex) {
            return cell;
          }

          return nextValue(cell);
        }),
      ),
    );
  }

  function handleCellClick(rowIndex, colIndex, event) {
    if (event.shiftKey) {
      event.preventDefault();
      updateCell(rowIndex, colIndex, (cell) => (cell === 'marked' ? 'empty' : 'marked'));
      return;
    }

    updateCell(rowIndex, colIndex, (cell) => (cell === 'filled' ? 'empty' : 'filled'));
  }

  function handleCellContext(rowIndex, colIndex, event) {
    event.preventDefault();
    updateCell(rowIndex, colIndex, (cell) => (cell === 'marked' ? 'empty' : 'marked'));
  }

  function getStatusText() {
    if (isComplete) {
      return '보고서 복구 완료';
    }

    if (mistakeCount > 0) {
      return '검증 오류';
    }

    return '감사 진행 중';
  }

  function getFootnoteText() {
    if (isComplete) {
      return '보고서 이미지가 복구되었습니다.';
    }

    if (mistakeCount > 0) {
      return `검증 오류 ${mistakeCount}건이 감지되었습니다.`;
    }

    return '좌클릭은 셀 강조, 우클릭 또는 Shift + 클릭은 제외 처리입니다.';
  }

  return (
    <>
      <tr className={hiddenClassName}>
        <th className="sheet-grid__row-header">1</th>
        <td colSpan={16} className="sheet-grid__cell nonogram-note-cell">
          픽셀 감사 보고서 모듈 실행 중
        </td>
        <td colSpan={10} className="sheet-grid__cell nonogram-back-cell">
          <button type="button" className="tetris-module__back-button" onClick={onBack}>
            업무 목록으로 돌아가기
          </button>
        </td>
      </tr>
      <tr className={hiddenClassName}>
        <th className="sheet-grid__row-header">2</th>
        <td colSpan={8} className="sheet-grid__cell nonogram-title-cell">
          <div className="tetris-module__eyebrow">내부 감사 모듈</div>
          <div className="tetris-module__title">픽셀 감사 보고서</div>
        </td>
        <td className="sheet-grid__cell" />
        <td colSpan={4} className="sheet-grid__cell nonogram-panel-heading-cell">
          <div className="tetris-side-panel__label">작업 현황</div>
        </td>
        {renderEmptyCells(13, 'nonogram-header')}
      </tr>
      {Array.from({ length: PANEL_ROW_SPAN }, (_, rowIndex) => (
        <tr key={`nonogram-row-${rowIndex}`} className={hiddenClassName}>
          <th className="sheet-grid__row-header">{rowIndex + 3}</th>
          {rowIndex === 0 ? (
            <>
              <td className="sheet-grid__cell nonogram-corner-cell" />
              {columnHints.map((hint, colIndex) => (
                <td key={`nonogram-col-hint-${colIndex}`} className="sheet-grid__cell nonogram-hint-cell">
                  <div className="nonogram-hint-cell__stack">
                    {hint.map((value, hintIndex) => (
                      <span key={`col-hint-${colIndex}-${hintIndex}`}>{value}</span>
                    ))}
                  </div>
                </td>
              ))}
            </>
          ) : rowIndex <= GRID_SIZE ? (
            <>
              <td className="sheet-grid__cell nonogram-hint-cell nonogram-hint-cell--row">
                <div className="nonogram-hint-cell__row-values">
                  {rowHints[rowIndex - 1].map((value, hintIndex) => (
                    <span key={`row-hint-${rowIndex}-${hintIndex}`}>{value}</span>
                  ))}
                </div>
              </td>
              {marks[rowIndex - 1].map((cell, colIndex) => (
                <td
                  key={`nonogram-cell-${rowIndex}-${colIndex}`}
                  className={`sheet-grid__cell nonogram-cell${cell === 'filled' ? ' nonogram-cell--filled' : ''}${cell === 'marked' ? ' nonogram-cell--marked' : ''}`}
                  onClick={(event) => handleCellClick(rowIndex - 1, colIndex, event)}
                  onContextMenu={(event) => handleCellContext(rowIndex - 1, colIndex, event)}
                >
                  <div className="nonogram-cell__inner">
                    {cell === 'marked' ? '×' : ''}
                  </div>
                </td>
              ))}
            </>
          ) : (
            renderEmptyCells(GRID_SIZE + 1, `nonogram-empty-grid-${rowIndex}`)
          )}
          <td className="sheet-grid__cell nonogram-gap-cell" />
          {rowIndex === 0 ? (
            <td rowSpan={PANEL_ROW_SPAN} colSpan={4} className="sheet-grid__cell nonogram-side-panel-cell">
              <aside className="nonogram-side-panel">
                <div className="tetris-side-panel__section">
                  <div className="tetris-side-panel__label">업무명</div>
                  <div className="tetris-side-panel__value">픽셀 감사 보고서</div>
                </div>
                <div className="tetris-side-panel__section">
                  <div className="tetris-side-panel__label">진행 상태</div>
                  <div className="tetris-side-panel__value">{getStatusText()}</div>
                </div>
                <div className="tetris-side-panel__section">
                  <div className="tetris-side-panel__label">셀 강조 수</div>
                  <div className="tetris-side-panel__value">{filledCount}</div>
                </div>
                <div className="tetris-side-panel__section">
                  <div className="tetris-side-panel__label">검증 오류</div>
                  <div className="tetris-side-panel__value">{mistakeCount}</div>
                </div>
                <div className="tetris-side-panel__section">
                  <div className="tetris-side-panel__label">안내</div>
                  <div className="nonogram-side-panel__description">
                    행과 열의 감사 수치를 기준으로 누락된 보고서 이미지를 복구합니다.
                  </div>
                </div>
                <button
                  type="button"
                  className="tetris-side-panel__start-button"
                  onClick={restartAudit}
                >
                  보고서 초기화
                </button>
                <div className={`tetris-side-panel__footnote${mistakeCount > 0 && !isComplete ? ' tetris-side-panel__footnote--alert' : ''}`}>
                  {getFootnoteText()}
                </div>
              </aside>
            </td>
          ) : null}
          {renderEmptyCells(15, `nonogram-filler-${rowIndex}`)}
        </tr>
      ))}
    </>
  );
}
