import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { STORAGE_KEY } from "@/constants";

const load = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const data = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(data)) return [];
    // Data lama/rusak: pastikan setiap board & kartu punya field yang dipakai UI
    return data
      .filter((b) => b && typeof b === "object")
      .map((b) => ({
        ...b,
        card: (Array.isArray(b.card) ? b.card : [])
          .filter((c) => c && typeof c === "object")
          .map((c) => ({
            ...c,
            tags: Array.isArray(c.tags) ? c.tags : [],
            task: Array.isArray(c.task) ? c.task : [],
          })),
      }));
  } catch {
    return [];
  }
};

const insertAt = (list, index, item) => {
  const next = [...list];
  next.splice(Math.min(Math.max(index, 0), next.length), 0, item);
  return next;
};

const short = (text, max = 28) =>
  text.length > max ? text.slice(0, max - 1) + "…" : text;

/**
 * Semua state & aksi untuk board/kartu (tersimpan di localStorage).
 * `notify({ message, undo })` dipanggil setelah aksi yang bisa diurungkan.
 */
export default function useBoards({ notify } = {}) {
  const [boards, setBoards] = useState(load);

  // Salinan terbaru, dipakai untuk membaca data sebelum dihapus
  const boardsRef = useRef(boards);
  boardsRef.current = boards;

  useEffect(() => {
    // Bisa gagal (penyimpanan penuh / mode privat) — jangan sampai aplikasi crash
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
    } catch (err) {
      console.warn("Gagal menyimpan ke localStorage:", err);
    }
  }, [boards]);

  // Tab lain mengubah data: ikuti, agar tab ini tidak menimpanya dengan data lama
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === null || e.key === STORAGE_KEY) setBoards(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addBoard = (title) =>
    setBoards((prev) => [
      ...prev,
      { id: uuidv4(), boardName: title, card: [] },
    ]);

  const removeBoard = (boardId) => {
    const index = boardsRef.current.findIndex((b) => b.id === boardId);
    if (index < 0) return;
    const board = boardsRef.current[index];
    setBoards((prev) => prev.filter((b) => b.id !== boardId));
    notify?.({
      message: `Board "${short(board.boardName || "tanpa nama")}" dihapus`,
      undo: () =>
        setBoards((prev) =>
          prev.some((b) => b.id === board.id)
            ? prev
            : insertAt(prev, index, board)
        ),
    });
  };

  const renameBoard = (title, boardId) =>
    setBoards((prev) =>
      prev.map((b) => (b.id === boardId ? { ...b, boardName: title } : b))
    );

  const addCard = (title, boardId) =>
    setBoards((prev) =>
      prev.map((b) =>
        b.id === boardId
          ? {
              ...b,
              card: [...b.card, { id: uuidv4(), title, tags: [], task: [] }],
            }
          : b
      )
    );

  const removeCard = (boardId, cardId) => {
    const board = boardsRef.current.find((b) => b.id === boardId);
    const index = board ? board.card.findIndex((c) => c.id === cardId) : -1;
    if (index < 0) return;
    const card = board.card[index];
    setBoards((prev) =>
      prev.map((b) =>
        b.id === boardId
          ? { ...b, card: b.card.filter((c) => c.id !== cardId) }
          : b
      )
    );
    notify?.({
      message: `Kartu "${short(card.title)}" dihapus`,
      undo: () =>
        setBoards((prev) =>
          prev.map((b) =>
            b.id === boardId && !b.card.some((c) => c.id === card.id)
              ? { ...b, card: insertAt(b.card, index, card) }
              : b
          )
        ),
    });
  };

  const updateCard = (boardId, cardId, card) =>
    setBoards((prev) =>
      prev.map((b) =>
        b.id === boardId
          ? { ...b, card: b.card.map((c) => (c.id === cardId ? card : c)) }
          : b
      )
    );

  // Dipanggil oleh @hello-pangea/dnd saat kartu dilepas
  const moveCard = (source, destination) =>
    setBoards((prev) => {
      const next = prev.map((b) => ({ ...b, card: [...b.card] }));
      const from = next.find((b) => b.id.toString() === source.droppableId);
      const to = next.find((b) => b.id.toString() === destination.droppableId);
      if (!from || !to) return prev;
      const [moved] = from.card.splice(source.index, 1);
      to.card.splice(destination.index, 0, moved);
      return next;
    });

  // Pindahkan kartu ke board lain lewat menu (tanpa drag) — ditaruh paling bawah
  const moveCardTo = (cardId, fromId, toId) => {
    if (fromId === toId) return;
    const snap = boardsRef.current;
    const from = snap.find((b) => b.id === fromId);
    const to = snap.find((b) => b.id === toId);
    const index = from ? from.card.findIndex((c) => c.id === cardId) : -1;
    if (index < 0 || !to) return;
    const card = from.card[index];
    setBoards((prev) =>
      prev.map((b) => {
        if (b.id === fromId)
          return { ...b, card: b.card.filter((c) => c.id !== cardId) };
        if (b.id === toId) return { ...b, card: [...b.card, card] };
        return b;
      })
    );
    notify?.({
      message: `"${short(card.title)}" dipindah ke ${short(
        to.boardName || "board tanpa nama"
      )}`,
      undo: () =>
        setBoards((prev) =>
          prev.map((b) => {
            if (b.id === toId)
              return { ...b, card: b.card.filter((c) => c.id !== cardId) };
            if (b.id === fromId && !b.card.some((c) => c.id === cardId))
              return { ...b, card: insertAt(b.card, index, card) };
            return b;
          })
        ),
    });
  };

  // Pindahkan urutan board (drag & drop board)
  const moveBoard = (fromIndex, toIndex) =>
    setBoards((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });

  // ---- Label lintas kartu ------------------------------------------------
  // Label dianggap "sama" bila nama (tanpa beda huruf besar/kecil) dan warnanya sama.
  const sameTag = (a, b) =>
    (a.tagName || "").trim().toLowerCase() ===
      (b.tagName || "").trim().toLowerCase() && a.color === b.color;

  // Jumlah kartu LAIN (selain exceptCardId) yang memakai label ini
  const countLabelCards = (tag, exceptCardId) =>
    boardsRef.current.reduce(
      (n, b) =>
        n +
        b.card.filter(
          (c) =>
            c.id !== exceptCardId && (c.tags || []).some((t) => sameTag(t, tag))
        ).length,
      0
    );

  // Ubah (next = {tagName, color}) atau hapus (next = null) satu label pada kartu `cardId`.
  // Dengan applyAll, kartu lain yang memakai label sama ikut berubah (tanpa menggandakan label).
  // Semuanya satu operasi dan bisa diurungkan (hanya field `tags` kartu terkait yang dipulihkan).
  const changeLabel = ({ cardId, tagId, next, applyAll }) => {
    const all = boardsRef.current.flatMap((b) => b.card);
    const own = all.find((c) => c.id === cardId);
    const tag = own?.tags?.find((t) => t.id === tagId);
    if (!own || !tag) return;

    const newTags = new Map(); // cardId -> tags baru
    const prevTags = new Map(); // cardId -> tags lama
    const apply = (card, tags) => {
      newTags.set(card.id, tags);
      prevTags.set(card.id, card.tags || []);
    };

    // kartu ini: berdasarkan id label
    apply(
      own,
      next
        ? own.tags.map((t) => (t.id === tagId ? { ...t, ...next } : t))
        : own.tags.filter((t) => t.id !== tagId)
    );

    // kartu lain: berdasarkan kesamaan nama + warna
    if (applyAll) {
      all.forEach((c) => {
        if (c.id === cardId || !(c.tags || []).some((t) => sameTag(t, tag)))
          return;
        const hasTarget = next && c.tags.some((t) => sameTag(t, next));
        apply(
          c,
          next && !hasTarget
            ? c.tags.map((t) => (sameTag(t, tag) ? { ...t, ...next } : t))
            : c.tags.filter((t) => !sameTag(t, tag))
        );
      });
    }

    const setTagsFor = (map) =>
      setBoards((prev) =>
        prev.map((b) => ({
          ...b,
          card: b.card.map((c) =>
            map.has(c.id) ? { ...c, tags: map.get(c.id) } : c
          ),
        }))
      );

    setTagsFor(newTags);

    const n = newTags.size;
    const name = short(tag.tagName || "tanpa nama");
    notify?.({
      message:
        n > 1
          ? `Label "${name}" ${next ? "diperbarui" : "dihapus"} di ${n} kartu`
          : `Label "${name}" ${next ? "diperbarui" : "dihapus"}`,
      undo: () => setTagsFor(prevTags),
    });
  };

  // Ganti seluruh data (impor backup); bisa diurungkan
  const replaceBoards = (nextBoards, message) => {
    const previous = boardsRef.current;
    setBoards(nextBoards);
    notify?.({ message, undo: () => setBoards(previous) });
  };

  return {
    boards,
    addBoard,
    removeBoard,
    renameBoard,
    addCard,
    removeCard,
    updateCard,
    moveCard,
    moveCardTo,
    moveBoard,
    replaceBoards,
    labelTools: {
      countOthers: countLabelCards,
      change: changeLabel,
    },
  };
}
