import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Search, Sliders, X } from "react-feather";
import FilterDialog from "../FilterDialog";
import { activeFilterCount } from "@/utils/filters";
import "./Toolbar.css";

export default function Toolbar({
  filters,
  labels,
  filtering,
  matchedCount,
  totalCount,
  onQuery,
  onDue,
  onToggleLabel,
  onReset,
}) {
  const [dialog, setDialog] = useState(false);
  const count = activeFilterCount(filters);

  return (
    <div className="toolbar">
      <div className="toolbar__search">
        <Search size={16} className="toolbar__search-icon" />
        <input
          type="search"
          value={filters.query}
          placeholder="Cari kartu…"
          aria-label="Cari kartu"
          onChange={(e) => onQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onQuery("");
          }}
        />
        {filters.query && (
          <button
            type="button"
            className="toolbar__clear"
            aria-label="Hapus pencarian"
            onClick={() => onQuery("")}
          >
            <X size={15} />
          </button>
        )}
      </div>

      <button
        type="button"
        className={`toolbar__btn${count ? " toolbar__btn--on" : ""}`}
        onClick={() => setDialog(true)}
      >
        <Sliders size={16} />
        <span>Filter</span>
        {count > 0 && <b className="toolbar__badge">{count}</b>}
      </button>

      {filtering && (
        <div className="toolbar__result" role="status">
          <span>
            <b>{matchedCount}</b> dari {totalCount} kartu
          </span>
          <button type="button" onClick={onReset}>
            Reset
          </button>
        </div>
      )}

      {/* Portal: toolbar bersifat sticky (lapisan sendiri), sehingga dialog
          di dalamnya tertimpa board. Render langsung di <body>. */}
      {dialog &&
        createPortal(
          <FilterDialog
            filters={filters}
            labels={labels}
            onDue={onDue}
            onToggleLabel={onToggleLabel}
            onReset={onReset}
            onClose={setDialog}
          />,
          document.body
        )}
    </div>
  );
}
