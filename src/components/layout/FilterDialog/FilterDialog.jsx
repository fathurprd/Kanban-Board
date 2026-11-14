import React from "react";
import { Popover } from "@/components/ui";
import { DUE_OPTIONS } from "@/utils/filters";
import "./FilterDialog.css";

export default function FilterDialog({
  filters,
  labels,
  onDue,
  onToggleLabel,
  onReset,
  onClose,
}) {
  return (
    <Popover title="Filter kartu" onClose={onClose}>
      <p className="label__caption">Tenggat</p>
      <div className="chips" role="radiogroup" aria-label="Filter tenggat">
        {DUE_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={filters.due === o.value}
            className="chip"
            onClick={() => onDue(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>

      <p className="label__caption">Label</p>
      {labels.length === 0 ? (
        <p className="filter__empty">Belum ada label di kartu mana pun.</p>
      ) : (
        <div className="chips" aria-label="Filter label">
          {labels.map((l) => (
            <button
              key={l.key}
              type="button"
              aria-pressed={filters.labels.includes(l.key)}
              className="chip"
              onClick={() => onToggleLabel(l.key)}
            >
              <i
                className="chip__dot"
                style={l.color ? { backgroundColor: l.color } : undefined}
              />
              {l.name}
            </button>
          ))}
        </div>
      )}

      <div className="filter__actions">
        <button type="button" className="confirm__cancel" onClick={onReset}>
          Reset
        </button>
        <button
          type="button"
          className="create__btn"
          onClick={() => onClose(false)}
        >
          Selesai
        </button>
      </div>
    </Popover>
  );
}
