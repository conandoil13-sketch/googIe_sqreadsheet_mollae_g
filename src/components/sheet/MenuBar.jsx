import { useRef } from 'react';

export default function MenuBar({
  onOpenHelp,
  onOpenFile,
  isHelpOpen = false,
}) {
  const menuItems = [
    '파일',
    '수정',
    '보기',
    '삽입',
    '서식',
    '데이터',
    '도구',
    '확장 프로그램',
    '도움말',
  ];
  const fileInputRef = useRef(null);

  function handleMenuClick(item) {
    if (item === '파일') {
      fileInputRef.current?.click();
      return;
    }

    if (item === '도움말') {
      onOpenHelp?.();
    }
  }

  function handleFileChange(event) {
    const [file] = event.target.files ?? [];

    if (file) {
      onOpenFile?.(file);
    }

    event.target.value = '';
  }

  return (
    <nav className="sheet-menubar" aria-label="Spreadsheet menu">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.tsv,.txt"
        className="sheet-menubar__file-input"
        onChange={handleFileChange}
      />
      {menuItems.map((item) => (
        <button
          key={item}
          type="button"
          className={`sheet-menubar__item${item === '도움말' && isHelpOpen ? ' sheet-menubar__item--active' : ''}`}
          onClick={() => handleMenuClick(item)}
        >
          {item}
        </button>
      ))}
    </nav>
  );
}
