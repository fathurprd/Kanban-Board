// dueDate disimpan sebagai string "YYYY-MM-DD"
const parse = (value) => {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const formatDue = (value) =>
  parse(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// "overdue" | "today" | "soon" (<= 2 hari) | "later"
export const dueStatus = (value) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((parse(value) - today) / 86400000);
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  if (diff <= 2) return "soon";
  return "later";
};

export const STATUS_TEXT = {
  overdue: "Terlambat",
  today: "Hari ini",
  soon: "Segera",
  later: "",
  done: "Selesai",
};

/** Status tenggat sebuah kartu: "" (tanpa tenggat) | "done" | "overdue" | "today" | "soon" | "later" */
export const cardDueStatus = (card) => {
  if (!card.dueDate) return "";
  const allDone = card.task?.length > 0 && card.task.every((t) => t.completed);
  return allDone ? "done" : dueStatus(card.dueDate);
};
