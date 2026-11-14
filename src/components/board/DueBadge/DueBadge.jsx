import React from "react";
import { Clock } from "react-feather";
import { formatDue, dueStatus, STATUS_TEXT } from "@/utils/date";
import "./DueBadge.css";

/**
 * Lencana tenggat. `done` = semua checklist selesai.
 * `showStatus` menambahkan teks status (mis. "Hari ini").
 * Jika `onClick` diberikan, badge jadi tombol.
 */
export default function DueBadge({
  date,
  done = false,
  showStatus = false,
  onClick,
}) {
  if (!date) return null;
  const status = done ? "done" : dueStatus(date);
  const statusText = STATUS_TEXT[status];
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      className={`due due--${status}${onClick ? " due--btn" : ""}`}
      title={statusText || "Tenggat"}
      onClick={onClick}
    >
      <Clock />
      {formatDue(date)}
      {showStatus && statusText && ` · ${statusText}`}
    </Tag>
  );
}
