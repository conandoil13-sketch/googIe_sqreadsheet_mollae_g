import fakeDocuments from '../../data/fakeDocuments';
import gameList from '../../data/gameList';
import FakeTaskRow from './FakeTaskRow';

function renderFillerCells(count, keyPrefix) {
  return Array.from({ length: count }, (_, index) => (
    <td key={`${keyPrefix}-${index}`} className="sheet-grid__cell launcher-cell" />
  ));
}

export default function GameLauncher({ currentGame, onSelectGame, statusMessage }) {
  const selectedGame = gameList.find((game) => game.id === currentGame);
  const gameMap = new Map(gameList.map((game) => [game.id, game]));
  const rows = fakeDocuments.launcherRows
    .map((row) => (row.type === 'game' ? gameMap.get(row.id) : row))
    .filter(Boolean);

  return (
    <>
      <tr className="game-launcher__title-row">
        <th className="sheet-grid__row-header">1</th>
        <td colSpan={10} className="sheet-grid__cell launcher-title-cell">
          <div className="launcher-title-block">
            <div className="launcher-title-block__title">{fakeDocuments.launcherTitle}</div>
            <div className="launcher-title-block__subtitle">부서별 처리 대기 항목 집계</div>
          </div>
        </td>
        <td colSpan={6} className="sheet-grid__cell launcher-summary-cell">
          최근 업데이트: {fakeDocuments.launcherUpdatedAt}
        </td>
        <td colSpan={5} className="sheet-grid__cell launcher-summary-cell">
          기준 문서: 내부 공유본
        </td>
        {renderFillerCells(5, 'launcher-title')}
      </tr>

      <tr className="game-launcher__subtitle-row">
        <th className="sheet-grid__row-header">2</th>
        <td colSpan={12} className="sheet-grid__cell launcher-subtitle-cell">
          자동화 요청, 검토 대기 업무, 임시 취합 항목을 통합 표시합니다.
        </td>
        <td colSpan={9} className="sheet-grid__cell launcher-help-cell">
          {fakeDocuments.launcherHint}
        </td>
        {renderFillerCells(5, 'launcher-subtitle')}
      </tr>

      <tr className="game-launcher__header-row">
        <th className="sheet-grid__row-header">3</th>
        <td className="sheet-grid__cell launcher-cell launcher-cell--header">
          <span className="sheet-grid__cell-content">업무명</span>
        </td>
        <td className="sheet-grid__cell launcher-cell launcher-cell--header">
          <span className="sheet-grid__cell-content">상태</span>
        </td>
        <td className="sheet-grid__cell launcher-cell launcher-cell--header">
          <span className="sheet-grid__cell-content">담당자</span>
        </td>
        <td className="sheet-grid__cell launcher-cell launcher-cell--header">
          <span className="sheet-grid__cell-content">마감일</span>
        </td>
        <td className="sheet-grid__cell launcher-cell launcher-cell--header">
          <span className="sheet-grid__cell-content">실행</span>
        </td>
        {renderFillerCells(21, 'launcher-header')}
      </tr>

      {rows.map((game, index) => (
        <FakeTaskRow
          key={game.id}
          game={game}
          rowNumber={index + 4}
          onSelectGame={onSelectGame}
        />
      ))}

      <tr className="game-launcher__message-row">
        <th className="sheet-grid__row-header">13</th>
        <td colSpan={9} className="sheet-grid__cell launcher-message-cell">
          <div className="launcher-message">
            {statusMessage ?? '업무 메모: 우선순위 및 접근 권한 기준으로 순차 검토 예정.'}
          </div>
        </td>
        <td colSpan={4} className="sheet-grid__cell launcher-meta-cell">
          승인 상태: 임시 집계
        </td>
        <td colSpan={4} className="sheet-grid__cell launcher-meta-cell">
          검토 기준: 내부 규칙
        </td>
        <td colSpan={4} className="sheet-grid__cell launcher-meta-cell">
          표시 범위: 1차 목록
        </td>
        {renderFillerCells(5, 'launcher-message')}
      </tr>

      <tr className="game-launcher__workspace-row">
        <th className="sheet-grid__row-header">14</th>
        <td colSpan={8} className="sheet-grid__cell launcher-workspace-cell">
          <section className="game-launcher">
            <div className="game-launcher__workspace">
              {selectedGame ? (
                <>
                  <div className="game-launcher__workspace-title">업무 처리 상태</div>
                  <div className="game-launcher__workspace-description">
                    {selectedGame.description}
                  </div>
                </>
              ) : (
                <>
                  <div className="game-launcher__workspace-title">검토 메모</div>
                  <div className="game-launcher__workspace-description">
                    담당 부서별 처리 우선순위와 접근 가능 항목을 확인 중입니다.
                  </div>
                </>
              )}
            </div>
          </section>
        </td>
        <td colSpan={6} className="sheet-grid__cell launcher-workspace-cell launcher-workspace-cell--muted">
          <div className="launcher-inline-card">
            <div className="launcher-inline-card__label">비고</div>
            <div className="launcher-inline-card__value">결재 전 임시 집계본</div>
          </div>
        </td>
        <td colSpan={6} className="sheet-grid__cell launcher-workspace-cell launcher-workspace-cell--muted">
          <div className="launcher-inline-card">
            <div className="launcher-inline-card__label">참조</div>
            <div className="launcher-inline-card__value">주간 자동화 항목 / 세부 작업 확인 가능</div>
          </div>
        </td>
        {renderFillerCells(6, 'launcher-workspace')}
      </tr>
    </>
  );
}
