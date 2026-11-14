import { v4 as uuidv4 } from "uuid";

const FORMAT = "kanban-board";
const VERSION = 1;

export const countCards = (boards) =>
  boards.reduce((sum, b) => sum + b.card.length, 0);

/** Unduh data papan sebagai file JSON. */
export const downloadBackup = (boards) => {
  const payload = {
    app: FORMAT,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    boards,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kanban-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const isObject = (v) => v && typeof v === "object" && !Array.isArray(v);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// "YYYY-MM-DD" yang benar-benar ada di kalender (menolak mis. 2026-13-45)
const isRealDate = (value) => {
  if (!DATE_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
  );
};

/** Pastikan id unik; buat baru bila kosong atau duplikat. */
const uniqueId = (id, used) => {
  let next =
    id !== undefined && id !== null && id !== "" ? String(id) : uuidv4();
  if (used.has(next)) next = uuidv4();
  used.add(next);
  return next;
};

/**
 * Validasi + rapikan data hasil impor.
 * Menerima {boards: [...]} (format ekspor) atau langsung array board.
 * Melempar Error dengan pesan yang ramah bila format tidak cocok.
 */
export const parseBackup = (text) => {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("File bukan JSON yang valid.");
  }
  const list = Array.isArray(raw) ? raw : isObject(raw) ? raw.boards : null;
  if (!Array.isArray(list))
    throw new Error("Format tidak dikenali: data board tidak ditemukan.");

  const usedBoards = new Set();
  const usedCards = new Set();

  return list.map((b, i) => {
    if (!isObject(b) || !Array.isArray(b.card))
      throw new Error(`Board #${i + 1} rusak (daftar kartu tidak ada).`);
    return {
      id: uniqueId(b.id, usedBoards),
      boardName: String(b.boardName ?? "Board"),
      card: b.card.map((c, j) => {
        if (!isObject(c))
          throw new Error(`Kartu #${j + 1} di board #${i + 1} rusak.`);
        const card = {
          id: uniqueId(c.id, usedCards),
          title: String(
            c.title ?? (typeof c.task === "string" ? c.task : "Tanpa judul")
          ),
          tags: Array.isArray(c.tags)
            ? c.tags.filter(isObject).map((t) => ({
                ...t,
                id: t.id ?? uuidv4(),
                tagName: String(t.tagName ?? ""),
              }))
            : [],
          task: Array.isArray(c.task)
            ? c.task.filter(isObject).map((t) => ({
                id: t.id ?? uuidv4(),
                task: String(t.task ?? ""),
                completed: Boolean(t.completed),
              }))
            : [],
        };
        if (typeof c.description === "string" && c.description)
          card.description = c.description;
        if (typeof c.dueDate === "string" && isRealDate(c.dueDate))
          card.dueDate = c.dueDate;
        return card;
      }),
    };
  });
};
