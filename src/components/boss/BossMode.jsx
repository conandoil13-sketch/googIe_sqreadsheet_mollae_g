function renderEmptyCells(count, keyPrefix) {
  return Array.from({ length: count }, (_, index) => (
    <td key={`${keyPrefix}-${index}`} className="sheet-grid__cell boss-cell" />
  ));
}

const bossRows = [
  ['월', '매출', '비용', '순이익', '전년 대비', '담당자'],
  ['1월', '128,400,000', '84,200,000', '44,200,000', '+6.2%', '김민지'],
  ['2월', '133,100,000', '87,900,000', '45,200,000', '+7.1%', '이도윤'],
  ['3월', '140,700,000', '92,100,000', '48,600,000', '+8.4%', '박서윤'],
  ['4월', '138,900,000', '90,300,000', '48,600,000', '+5.9%', '정하준'],
  ['5월', '145,500,000', '93,800,000', '51,700,000', '+9.3%', '최지안'],
  ['6월', '149,200,000', '95,400,000', '53,800,000', '+10.1%', '한시우'],
];

const DEFAULT_DOCUMENT = {
  filename: '2026_2분기_매출정산표_공유용.csv',
  noteLeft: '2분기 매출 정산 초안 검토본',
  noteRight: '공유 범위: 내부',
  rows: bossRows,
  summaryLeft: '합계 검토 완료 예정',
  summaryRight: '검토자 서명 대기',
  saveLabel: '자동 저장됨',
};

export default function BossMode({ documentData }) {
  const activeDocument = documentData ?? DEFAULT_DOCUMENT;
  const visibleRows = activeDocument.rows.slice(0, 14);
  const maxColumns = Math.min(
    12,
    Math.max(...visibleRows.map((row) => row.length), 6),
  );

  return (
    <>
      <tr className="boss-row">
        <th className="sheet-grid__row-header">1</th>
        <td colSpan={8} className="sheet-grid__cell boss-note-cell">
          {activeDocument.noteLeft}
        </td>
        <td colSpan={6} className="sheet-grid__cell boss-note-cell">
          {activeDocument.noteRight}
        </td>
        {renderEmptyCells(12, 'boss-note')}
      </tr>

      {visibleRows.map((row, index) => (
        <tr key={`boss-data-${index}`} className="boss-row">
          <th className="sheet-grid__row-header">{index + 2}</th>
          {Array.from({ length: maxColumns }, (_, cellIndex) => row[cellIndex] ?? '').map((value, cellIndex) => (
            <td
              key={`boss-cell-${index}-${cellIndex}`}
              className={`sheet-grid__cell boss-cell${index === 0 ? ' boss-cell--header' : ''}`}
            >
              <span className="sheet-grid__cell-content">{value}</span>
            </td>
          ))}
          {renderEmptyCells(26 - maxColumns, `boss-filler-${index}`)}
        </tr>
      ))}

      <tr className="boss-row">
        <th className="sheet-grid__row-header">{visibleRows.length + 2}</th>
        <td colSpan={6} className="sheet-grid__cell boss-summary-cell">
          {activeDocument.summaryLeft}
        </td>
        <td colSpan={5} className="sheet-grid__cell boss-summary-cell">
          {activeDocument.summaryRight}
        </td>
        {renderEmptyCells(15, 'boss-summary')}
      </tr>

      <tr className="boss-row">
        <th className="sheet-grid__row-header">{visibleRows.length + 3}</th>
        {renderEmptyCells(22, 'boss-empty')}
        <td colSpan={4} className="sheet-grid__cell boss-save-cell">
          {activeDocument.saveLabel}
        </td>
      </tr>
    </>
  );
}
