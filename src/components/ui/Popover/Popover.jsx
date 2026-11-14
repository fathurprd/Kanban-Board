import React, { useEffect } from "react";
import { X } from "react-feather";
import "./Popover.css";

/** Dialog kecil di tengah layar dengan overlay; klik overlay = tutup. */
export default function Popover({ title, onClose, children }) {
  // Esc hanya menutup popover ini, bukan modal kartu di bawahnya
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onClose(false);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  return (
    <div
      className="popover__wrapper"
      onClick={(e) => {
        e.stopPropagation();
        onClose(false);
      }}
    >
      <div
        className="popover__content"
        role="dialog"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="label__heading">
          <b>{title}</b>
          <button
            type="button"
            className="icon__btn"
            aria-label="Tutup"
            onClick={() => onClose(false)}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
