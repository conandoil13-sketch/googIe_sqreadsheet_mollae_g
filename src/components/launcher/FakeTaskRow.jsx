const totalColumns = 26;

function getStatusClassName(status) {
  if (status === '긴급') {
    return ' launcher-cell--status-urgent';
  }

  if (status === '진행중') {
    return ' launcher-cell--status-active';
  }

  if (status === '완료') {
    return ' launcher-cell--status-complete';
  }

  if (status === '대기중') {
    return ' launcher-cell--status-pending';
  }

  if (status === '보류') {
    return ' launcher-cell--status-onhold';
  }

  return '';
}

export default function FakeTaskRow({ game, rowNumber, onSelectGame }) {
  const fillerCellCount = totalColumns - 5;
  const isInteractive = game.available;
  const rowClassName = `fake-task-row${isInteractive ? ' fake-task-row--interactive' : ''}`;

  return (
    <tr className={rowClassName}>
      <th className="sheet-grid__row-header">{rowNumber}</th>
      <td className="sheet-grid__cell launcher-cell">
        <span className="sheet-grid__cell-content">{game.fakeTaskName}</span>
      </td>
      <td className={`sheet-grid__cell launcher-cell ${getStatusClassName(game.fakeStatus)}`}>
        <span className="sheet-grid__cell-content launcher-status">{game.fakeStatus}</span>
      </td>
      <td className="sheet-grid__cell launcher-cell">
        <span className="sheet-grid__cell-content">{game.fakeDepartment}</span>
      </td>
      <td className="sheet-grid__cell launcher-cell">
        <span className="sheet-grid__cell-content">{game.fakeDeadline}</span>
      </td>
      <td className="sheet-grid__cell launcher-cell launcher-cell--action">
        <button
          type="button"
          className={`launcher-action-chip${game.available ? '' : ' launcher-action-chip--locked'}`}
          onClick={() => onSelectGame(game)}
        >
          {game.fakeButtonLabel}
        </button>
      </td>
      {Array.from({ length: fillerCellCount }, (_, index) => (
        <td key={`${game.id}-filler-${index}`} className="sheet-grid__cell launcher-cell" />
      ))}
    </tr>
  );
}
