import React from "react";
import Popover from "../Popover";
import "./ConfirmDialog.css";

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Ya, lanjutkan",
  onConfirm,
  onClose,
}) {
  return (
    <Popover title={title} onClose={onClose}>
      <p className="confirm__msg">{message}</p>
      <div className="confirm__actions">
        <button
          type="button"
          className="confirm__cancel"
          onClick={() => onClose(false)}
        >
          Batal
        </button>
        <button
          type="button"
          className="create__btn"
          autoFocus
          onClick={() => {
            onConfirm();
            onClose(false);
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Popover>
  );
}
