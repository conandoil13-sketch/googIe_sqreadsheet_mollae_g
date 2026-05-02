const columnLabels = Array.from({ length: 26 }, (_, index) =>
  String.fromCharCode(65 + index),
);

const rowCount = 30;

export default function SheetGrid({ children, occupiedRowCount = 8 }) {
  const rows = Array.from(
    { length: rowCount - occupiedRowCount },
    (_, index) => index + occupiedRowCount + 1,
  );

  return (
    <main className="sheet-grid">
      <div className="sheet-grid__viewport">
        <table className="sheet-grid__table" aria-label="Fake spreadsheet grid">
          <thead>
            <tr>
              <th className="sheet-grid__corner" />
              {columnLabels.map((label) => (
                <th key={label} className="sheet-grid__column-header">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {children}
            {rows.map((rowNumber) => (
              <tr key={rowNumber}>
                <th className="sheet-grid__row-header">{rowNumber}</th>
                {columnLabels.map((columnLabel) => (
                  <td key={`${columnLabel}${rowNumber}`} className="sheet-grid__cell" />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
