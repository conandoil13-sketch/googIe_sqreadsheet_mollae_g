export default function Toolbar({
  sheetScale = '100',
  onSheetScaleChange = () => {},
}) {
  const textTools = ['기본 서체', '10', 'B', 'I', '정렬'];
  const scaleOptions = [
    { id: '50', label: '50%' },
    { id: '75', label: '75%' },
    { id: '100', label: '100%' },
    { id: '110', label: '110%' },
    { id: '130', label: '130%' },
  ];

  return (
    <div className="sheet-toolbar" aria-label="Spreadsheet toolbar">
      <div className="sheet-toolbar__group">
        <button type="button" className="sheet-toolbar__button sheet-toolbar__icon-button" aria-label="실행취소">
          <svg viewBox="0 0 24 24" className="sheet-toolbar__icon" aria-hidden="true">
            <path
              d="M9 7L5.5 10.5L9 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 10.5H13C16.3137 10.5 19 13.1863 19 16.5V18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button type="button" className="sheet-toolbar__button sheet-toolbar__icon-button" aria-label="다시 실행">
          <svg viewBox="0 0 24 24" className="sheet-toolbar__icon" aria-hidden="true">
            <path
              d="M15 7L18.5 10.5L15 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18 10.5H11C7.68629 10.5 5 13.1863 5 16.5V18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button type="button" className="sheet-toolbar__button sheet-toolbar__icon-button" aria-label="인쇄">
          <svg viewBox="0 0 24 24" className="sheet-toolbar__icon" aria-hidden="true">
            <path
              d="M8 9V5.5H16V9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="6"
              y="9"
              width="12"
              height="7"
              rx="2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M8.5 14.5H15.5V18.5H8.5V14.5Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="sheet-toolbar__divider" aria-hidden="true" />
      <div className="sheet-toolbar__group">
        <label className="sheet-toolbar__zoom-label">
          <select
            className="sheet-toolbar__zoom-select"
            aria-label="Sheet zoom"
            value={sheetScale}
            onChange={(event) => onSheetScaleChange(event.target.value)}
          >
            {scaleOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="sheet-toolbar__divider" aria-hidden="true" />
      <div className="sheet-toolbar__group">
        {textTools.map((tool) => (
          <button
            key={tool}
            type="button"
            className={`sheet-toolbar__button${tool.length > 2 ? ' sheet-toolbar__button--wide' : ''}`}
          >
            {tool}
          </button>
        ))}
      </div>
    </div>
  );
}
