const formulaCommands = [
  ['=PLAY("INVENTORY_SORT")', '떨어지는 재고 블록을 정리하는 화면을 엽니다.'],
  ['=RUN("ERROR_CHECK")', '숨은 손상 셀을 찾아 검토하는 화면을 엽니다.'],
  ['=PLAY("SUM2048")', '같은 수치를 합쳐 누적 합계를 키우는 화면을 엽니다.'],
  ['=SUMGAME()', '같은 수치를 모아 합산하는 작업을 바로 시작합니다.'],
  ['=AUDIT("PIXEL_REPORT")', '숫자 힌트로 이미지를 복구하는 감사 화면을 엽니다.'],
  ['=ROUTE("APPROVAL_LINE")', '표시를 이어 결재선을 완성하는 화면을 엽니다.'],
];

const shortcuts = [
  ['ESC', '화면을 바로 일반 업무표로 숨깁니다.'],
  ['Shift + Enter', '숨긴 작업 화면으로 다시 돌아갑니다.'],
  ['방향키', '현재 작업을 움직이거나 정렬합니다.'],
  ['마우스 우클릭 / Shift + 클릭', '검토 필요 표시 또는 제외 표시를 남깁니다.'],
];

const menuActions = [
  ['파일', 'CSV, TSV, TXT 표 파일을 올려 보스 모드에 표시할 문서로 바꿉니다.'],
  ['도움말', '실행 명령어와 조작 방법을 다시 확인합니다.'],
];

const modules = [
  ['재고 정리 자동화', '떨어지는 데이터를 정리하듯 블록을 맞춰 쌓는 작업입니다.'],
  ['오류 셀 검토', '안전한 셀만 열어가며 손상된 데이터를 피하는 작업입니다.'],
  ['자동 합산 테스트', '같은 값을 모아 더 큰 값으로 합치는 작업입니다.'],
  ['픽셀 감사 보고서', '힌트를 보고 셀을 채워 숨겨진 이미지를 복구하는 작업입니다.'],
  ['결재선 배치', '표시를 이어 5칸 연속 결재선을 만드는 작업입니다.'],
];

function renderRows(items) {
  return items.map(([label, value]) => (
    <div key={label} className="sheet-help-panel__row">
      <div className="sheet-help-panel__label">{label}</div>
      <div className="sheet-help-panel__value">{value}</div>
    </div>
  ));
}

export default function HelpPanel({ onClose }) {
  return (
    <aside className="sheet-help-panel" aria-label="도움말 패널">
      <div className="sheet-help-panel__header">
        <div>
          <div className="sheet-help-panel__title">도움말</div>
          <div className="sheet-help-panel__subtitle">
            자주 쓰는 실행 명령어와 조작 방법을 빠르게 확인할 수 있습니다.
          </div>
        </div>
        <button type="button" className="sheet-help-panel__close" onClick={onClose}>
          닫기
        </button>
      </div>

      <section className="sheet-help-panel__section">
        <div className="sheet-help-panel__section-title">바로 실행 명령어</div>
        {renderRows(formulaCommands)}
      </section>

      <section className="sheet-help-panel__section">
        <div className="sheet-help-panel__section-title">빠른 전환 / 조작</div>
        {renderRows(shortcuts)}
      </section>

      <section className="sheet-help-panel__section">
        <div className="sheet-help-panel__section-title">상단 메뉴</div>
        {renderRows(menuActions)}
      </section>

      <section className="sheet-help-panel__section">
        <div className="sheet-help-panel__section-title">작업별 설명</div>
        {renderRows(modules)}
      </section>
    </aside>
  );
}
