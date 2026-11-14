import React, { useEffect } from "react";
import { X } from "react-feather";
import "./Toast.css";

/**
 * Notifikasi kecil di bawah layar. Hilang otomatis setelah `duration` ms.
 * Berikan `key` yang berubah untuk mereset timer saat pesan baru muncul.
 */
export default function Toast({
  message,
  actionLabel,
  onAction,
  onClose,
  variant = "default",
  duration = 7000,
}) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="toast__region">
      <div
        className={`toast toast--${variant}`}
        role={variant === "error" ? "alert" : "status"}
      >
        <span className="toast__msg">{message}</span>
        {onAction && (
          <button
            type="button"
            className="toast__action"
            onClick={() => {
              onAction();
              onClose();
            }}
          >
            {actionLabel || "Urungkan"}
          </button>
        )}
        <button
          type="button"
          className="toast__close"
          aria-label="Tutup notifikasi"
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
