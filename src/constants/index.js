export const STORAGE_KEY = "kanban-board";
export const THEME_KEY = "theme";

// Mode daftar (board ditumpuk vertikal): HP portrait, atau HP landscape
// (layar sentuh pendek). HARUS sama dengan media query di app.css & Board.css.
export const LIST_MODE_QUERY =
  "(max-width: 640px), (orientation: landscape) and (max-height: 480px) and (pointer: coarse)";

// Warna yang tersedia untuk label kartu
export const LABEL_COLORS = [
  "#61bd4f",
  "#f2d600",
  "#ff9f1a",
  "#eb5a46",
  "#c377e0",
];
