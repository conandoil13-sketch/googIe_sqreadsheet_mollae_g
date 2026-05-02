import { useState } from 'react';
import BossMode from './components/boss/BossMode';
import SheetFrame from './components/sheet/SheetFrame';
import GameLauncher from './components/launcher/GameLauncher';
import Game2048 from './games/game2048/Game2048';
import MinesweeperGame from './games/minesweeper/MinesweeperGame';
import NonogramGame from './games/nonogram/NonogramGame';
import OmokGame from './games/omok/OmokGame';
import TetrisGame from './games/tetris/TetrisGame';
import useBossMode from './hooks/useBossMode';
import useKeyboardShortcut from './hooks/useKeyboardShortcut';

function parseDelimitedText(text) {
  const normalized = text.replace(/\r\n/g, '\n').trim();

  if (!normalized) {
    return [];
  }

  const lines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const delimiter = lines.some((line) => line.includes('\t')) ? '\t' : ',';

  return lines.map((line) =>
    line.split(delimiter).map((cell) => cell.trim().replace(/^"(.*)"$/, '$1')),
  );
}

function createBossDocument(fileName, rows) {
  const safeRows = rows.filter((row) => row.some((cell) => cell));
  const visibleRows = safeRows.length ? safeRows : [['항목', '값'], ['업로드 실패', '표 형식 확인 필요']];
  const previewName = fileName.replace(/\.[^.]+$/, '');

  return {
    filename: fileName,
    noteLeft: `${previewName} 검토본`,
    noteRight: `공유 범위: 업로드 문서`,
    rows: visibleRows,
    summaryLeft: `행 수: ${Math.max(visibleRows.length - 1, 0)} / 열 수: ${Math.max(...visibleRows.map((row) => row.length), 0)}`,
    summaryRight: '열람 전용 표시',
    saveLabel: '자동 저장됨',
  };
}

export default function App() {
  const [currentGame, setCurrentGame] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [sheetScale, setSheetScale] = useState('100');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [bossDocument, setBossDocument] = useState(null);
  const { isBossMode, enterBossMode, exitBossMode } = useBossMode(false);

  useKeyboardShortcut((event) => event.key === 'Escape', (event) => {
    event.preventDefault();

    if (isHelpOpen) {
      setIsHelpOpen(false);
      return;
    }

    enterBossMode();
  });

  useKeyboardShortcut(
    (event) => event.key === 'Enter' && event.shiftKey,
    (event) => {
      event.preventDefault();
      exitBossMode();
    },
  );

  function handleSelectGame(game) {
    if (!game.available) {
      setStatusMessage(game.noticeMessage ?? '업무 메모: 아직 이 업무는 잠겨 있습니다.');
      return;
    }

    setCurrentGame(game.id);
    setStatusMessage(`업무 메모: ${game.fakeTaskName} 작업을 여는 중입니다.`);
  }

  function handleBackToLauncher() {
    setCurrentGame(null);
    setStatusMessage('업무 메모: 업무 목록 화면으로 돌아왔습니다.');
  }

  function handleFormulaSubmit(rawValue) {
    const normalizedValue = rawValue.trim().toUpperCase();

    if (normalizedValue === '=PLAY("SUM2048")' || normalizedValue === '=SUMGAME()') {
      setCurrentGame('2048');
      setStatusMessage('업무 메모: 자동 합산 테스트 작업을 여는 중입니다.');
      return;
    }

    if (normalizedValue === '=RUN("ERROR_CHECK")') {
      setCurrentGame('minesweeper');
      setStatusMessage('업무 메모: 오류 셀 검토 작업을 여는 중입니다.');
      return;
    }

    if (normalizedValue === '=PLAY("INVENTORY_SORT")') {
      setCurrentGame('tetris');
      setStatusMessage('업무 메모: 재고 정리 자동화 작업을 여는 중입니다.');
    }
  }

  async function handleOpenFile(file) {
    const isDelimitedFile = /\.(csv|tsv|txt)$/i.test(file.name);

    if (!isDelimitedFile) {
      setStatusMessage('업무 메모: CSV, TSV, TXT 형식만 보스 모드 문서로 사용할 수 있습니다.');
      return;
    }

    try {
      const text = await file.text();
      const rows = parseDelimitedText(text);

      if (!rows.length) {
        setStatusMessage('업무 메모: 파일을 읽었지만 표시할 표 데이터가 없습니다.');
        return;
      }

      setBossDocument(createBossDocument(file.name, rows));
      setStatusMessage(`업무 메모: ${file.name} 파일을 보스 모드 문서로 불러왔습니다.`);
    } catch (error) {
      setStatusMessage('업무 메모: 파일을 읽는 중 문제가 발생했습니다.');
    }
  }

  const formulaValue =
    isBossMode
      ? bossDocument
        ? '=IMPORT("LOCAL_SHEET")'
        : '=SUM(C2:C18)'
      : currentGame === 'tetris'
        ? '=PLAY("INVENTORY_SORT")'
        : currentGame === 'minesweeper'
          ? '=RUN("ERROR_CHECK")'
          : currentGame === '2048'
            ? '=PLAY("SUM2048")'
            : currentGame === 'nonogram'
              ? '=AUDIT("PIXEL_REPORT")'
            : currentGame === 'omok'
              ? '=ROUTE("APPROVAL_LINE")'
        : '=SUM(B2:B17)';

  const documentTitle = isBossMode
    ? bossDocument?.filename?.replace(/\.[^.]+$/, '') ?? '2026_2분기_매출정산표_공유용'
    : '2026_상반기_업무정산표_FINAL';

  const saveStateText = isBossMode ? '' : '자동 저장됨';
  const occupiedRowCount = isBossMode
    ? Math.min((bossDocument?.rows?.length ?? 7) + 3, 18)
    : currentGame === 'tetris'
      ? 22
      : currentGame === 'minesweeper'
        ? 14
        : currentGame === '2048'
          ? 6
          : currentGame === 'nonogram'
            ? 7
            : currentGame === 'omok'
              ? 17
              : 14;

  return (
    <SheetFrame
      formulaValue={formulaValue}
      documentTitle={documentTitle}
      saveStateText={saveStateText}
      sheetScale={sheetScale}
      occupiedRowCount={occupiedRowCount}
      isHelpOpen={isHelpOpen}
      onSheetScaleChange={setSheetScale}
      onFormulaSubmit={handleFormulaSubmit}
      onOpenHelp={() => setIsHelpOpen(true)}
      onCloseHelp={() => setIsHelpOpen(false)}
      onOpenFile={handleOpenFile}
    >
      {currentGame === 'tetris' ? (
        <>
          <TetrisGame
            onBack={handleBackToLauncher}
            isPaused={isBossMode}
            isHidden={isBossMode}
          />
          {isBossMode ? <BossMode documentData={bossDocument} /> : null}
        </>
      ) : currentGame === 'minesweeper' ? (
        isBossMode ? (
          <BossMode documentData={bossDocument} />
        ) : (
          <MinesweeperGame onBack={handleBackToLauncher} />
        )
      ) : currentGame === '2048' ? (
        isBossMode ? (
          <BossMode documentData={bossDocument} />
        ) : (
          <Game2048 onBack={handleBackToLauncher} />
        )
      ) : currentGame === 'nonogram' ? (
        isBossMode ? (
          <BossMode documentData={bossDocument} />
        ) : (
          <NonogramGame onBack={handleBackToLauncher} />
        )
      ) : currentGame === 'omok' ? (
        isBossMode ? (
          <BossMode documentData={bossDocument} />
        ) : (
          <OmokGame onBack={handleBackToLauncher} />
        )
      ) : (
        isBossMode ? (
          <BossMode documentData={bossDocument} />
        ) : (
          <GameLauncher
            currentGame={currentGame}
            onSelectGame={handleSelectGame}
            statusMessage={statusMessage}
          />
        )
      )}
    </SheetFrame>
  );
}
