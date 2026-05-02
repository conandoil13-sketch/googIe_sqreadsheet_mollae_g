import MenuBar from './MenuBar';
import Toolbar from './Toolbar';
import FormulaBar from './FormulaBar';
import SheetGrid from './SheetGrid';
import SheetTabs from './SheetTabs';
import StatusBar from './StatusBar';
import HelpPanel from './HelpPanel';

export default function SheetFrame({
  children,
  formulaValue,
  documentTitle = '2026_상반기_업무정산표_FINAL',
  saveStateText = '자동 저장됨',
  sheetScale = '100',
  occupiedRowCount = 8,
  isHelpOpen = false,
  onSheetScaleChange,
  onFormulaSubmit,
  onOpenHelp,
  onCloseHelp,
  onOpenFile,
}) {
  return (
    <div className={`sheet-frame sheet-frame--zoom-${sheetScale}`}>
      <div className="sheet-app-bar" aria-hidden="true" />
      <div className="sheet-document-bar">
        <div className="sheet-document-bar__left">
          <div className="sheet-document-icon" aria-hidden="true" />
          <div className="sheet-document-meta">
            <div className="sheet-document-title">{documentTitle}</div>
          </div>
        </div>
        {saveStateText ? (
          <div className="sheet-document-save-state">{saveStateText}</div>
        ) : null}
      </div>
      <MenuBar
        onOpenHelp={onOpenHelp}
        onOpenFile={onOpenFile}
        isHelpOpen={isHelpOpen}
      />
      <Toolbar
        sheetScale={sheetScale}
        onSheetScaleChange={onSheetScaleChange}
      />
      <FormulaBar
        formulaValue={formulaValue}
        onFormulaSubmit={onFormulaSubmit}
      />
      <SheetGrid occupiedRowCount={occupiedRowCount}>{children}</SheetGrid>
      <div className="sheet-bottom-bar">
        <SheetTabs />
        <StatusBar onOpenHelp={onOpenHelp} />
      </div>
      {isHelpOpen ? (
        <>
          <button
            type="button"
            className="sheet-help-backdrop"
            aria-label="도움말 닫기"
            onClick={onCloseHelp}
          />
          <HelpPanel onClose={onCloseHelp} />
        </>
      ) : null}
    </div>
  );
}
