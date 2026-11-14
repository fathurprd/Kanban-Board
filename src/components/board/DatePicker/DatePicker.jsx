import React, { useState } from "react";
import { Popover } from "@/components/ui";
import "./DatePicker.css";

export default function DatePicker({ value, onSave, onClose }) {
  const [date, setDate] = useState(value || "");

  return (
    <Popover title="Tenggat" onClose={onClose}>
      <p className="label__caption">Tanggal</p>
      <div className="label__input">
        <input
          type="date"
          autoFocus
          value={date}
          onChange={(e) => setDate(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && date) {
              onSave(date);
              onClose(false);
            }
          }}
        />
      </div>

      <div className="date__actions">
        <button
          type="button"
          className="create__btn"
          disabled={!date}
          onClick={() => {
            onSave(date);
            onClose(false);
          }}
        >
          Simpan
        </button>
        {value && (
          <button
            type="button"
            className="date__remove"
            onClick={() => {
              onSave("");
              onClose(false);
            }}
          >
            Hapus
          </button>
        )}
      </div>
    </Popover>
  );
}
