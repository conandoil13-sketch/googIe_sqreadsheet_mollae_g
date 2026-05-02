import { useEffect, useState } from 'react';

export default function FormulaBar({
  formulaValue = '=SUM(B2:B17)',
  cellName = 'A1',
  onFormulaSubmit,
}) {
  const [inputValue, setInputValue] = useState(formulaValue);

  useEffect(() => {
    setInputValue(formulaValue);
  }, [formulaValue]);

  function handleSubmit(event) {
    event.preventDefault();
    onFormulaSubmit?.(inputValue);
  }

  return (
    <form className="sheet-formula-bar" onSubmit={handleSubmit}>
      <div className="sheet-formula-bar__cell-name">{cellName}</div>
      <div className="sheet-formula-bar__fx">fx</div>
      <input
        className="sheet-formula-bar__input"
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
      />
    </form>
  );
}
