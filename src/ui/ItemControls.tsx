import type { SortableControls } from './SortableList';
import { IconDown, IconEye, IconEyeOff, IconGrip, IconTrash, IconUp } from './icons';

interface Props {
  controls: SortableControls;
  hidden?: boolean;
  onToggleHidden?: () => void;
  onDelete?: () => void;
  /** Klausti patvirtinimo prieš trinant (pvz. didesniems įrašams). */
  confirmDelete?: string;
}

/** Įrašo valdikliai: tempimas, aukštyn/žemyn, slėpti, trinti. */
export function ItemControls({ controls, hidden, onToggleHidden, onDelete, confirmDelete }: Props) {
  return (
    <div className="item-controls">
      <button type="button" className="icon-btn drag-handle" title="Tempkite, kad perkeltumėte" {...controls.handleProps}>
        <IconGrip />
      </button>
      <button type="button" className="icon-btn" title="Aukštyn" disabled={controls.index === 0} onClick={controls.moveUp}>
        <IconUp />
      </button>
      <button
        type="button"
        className="icon-btn"
        title="Žemyn"
        disabled={controls.index === controls.count - 1}
        onClick={controls.moveDown}
      >
        <IconDown />
      </button>
      {onToggleHidden && (
        <button
          type="button"
          className={hidden ? 'icon-btn active' : 'icon-btn'}
          title={hidden ? 'Paslėpta CV. Spauskite, kad rodytų' : 'Slėpti CV'}
          aria-pressed={!!hidden}
          onClick={onToggleHidden}
        >
          {hidden ? <IconEyeOff /> : <IconEye />}
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          className="icon-btn danger"
          title="Ištrinti"
          onClick={() => {
            if (!confirmDelete || window.confirm(confirmDelete)) onDelete();
          }}
        >
          <IconTrash />
        </button>
      )}
    </div>
  );
}
