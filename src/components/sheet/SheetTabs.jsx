export default function SheetTabs() {
  const tabs = ['업무현황', '정산표', '백업본', '숨김시트'];

  return (
    <div className="sheet-tabs" role="tablist" aria-label="Sheet tabs">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          type="button"
          className={`sheet-tabs__tab${index === 0 ? ' sheet-tabs__tab--active' : ''}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
