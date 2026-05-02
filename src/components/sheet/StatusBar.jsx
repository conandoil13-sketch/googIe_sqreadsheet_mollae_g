export default function StatusBar({ onOpenHelp }) {
  return (
    <footer className="sheet-status-bar">
      <div>준비 완료</div>
      <div className="sheet-status-bar__right">
        <button type="button" className="sheet-status-bar__help-button" onClick={onOpenHelp}>
          도움말
        </button>
        <span>평균: 0, 개수: 0, 합계: 0</span>
      </div>
    </footer>
  );
}
