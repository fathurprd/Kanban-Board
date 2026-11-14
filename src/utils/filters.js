import { cardDueStatus } from "@/utils/date";

export const DEFAULT_FILTERS = { query: "", due: "all", labels: [] };

export const DUE_OPTIONS = [
  { value: "all", label: "Semua" },
  { value: "overdue", label: "Terlambat" },
  { value: "today", label: "Hari ini" },
  { value: "soon", label: "Segera (≤ 2 hari)" },
  { value: "none", label: "Tanpa tenggat" },
];

export const labelKey = (tag) =>
  `${(tag.tagName || "").trim().toLowerCase()}|${tag.color || ""}`;

/** Daftar label unik dari semua kartu (untuk pilihan filter). */
export const collectLabels = (boards) => {
  const map = new Map();
  boards.forEach((b) =>
    b.card.forEach((c) =>
      (c.tags || []).forEach((t) => {
        if (t.tagName && !map.has(labelKey(t)))
          map.set(labelKey(t), {
            key: labelKey(t),
            name: t.tagName,
            color: t.color,
          });
      })
    )
  );
  return [...map.values()];
};

export const isFiltering = (f) =>
  f.query.trim() !== "" || f.due !== "all" || f.labels.length > 0;

/** Jumlah kriteria aktif (untuk badge tombol Filter, tanpa pencarian teks). */
export const activeFilterCount = (f) =>
  (f.due !== "all" ? 1 : 0) + f.labels.length;

export const matchesFilters = (card, f) => {
  const q = f.query.trim().toLowerCase();
  if (q) {
    const haystack = [
      card.title,
      card.description,
      ...(card.tags || []).map((t) => t.tagName),
      ...(card.task || []).map((t) => t.task),
    ]
      .filter(Boolean)
      .join("\n")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  if (f.due !== "all") {
    const status = cardDueStatus(card);
    if (f.due === "none" ? status !== "" : status !== f.due) return false;
  }

  if (f.labels.length > 0) {
    const keys = (card.tags || []).map(labelKey);
    if (!f.labels.some((k) => keys.includes(k))) return false;
  }
  return true;
};
