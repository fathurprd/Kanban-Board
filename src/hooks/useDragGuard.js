import { useEffect } from "react";

const isDragging = () =>
  !!document.querySelector(".board--dragging, .custom__card--dragging");

/**
 * Pengaman drag & drop.
 *
 * 1. Drag "beku": kalau tombol mouse sudah dilepas tetapi halaman tidak menerima
 *    event `mouseup` (mis. dilepas di luar jendela, di atas UI browser, atau
 *    tertelan overlay/screenshot), library tetap mengira masih menyeret dan
 *    kartu/board tersangkut. Kita deteksi lewat `mousemove` dengan `buttons === 0`
 *    lalu membatalkan drag (sama seperti menekan Esc).
 * 2. Mencegah drag bawaan browser (teks terpilih / link / gambar) membajak
 *    event mouse di area board.
 */
export default function useDragGuard() {
  useEffect(() => {
    let mouseHeld = false;

    const cancelDrag = () =>
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Escape",
          code: "Escape",
          keyCode: 27,
          which: 27,
          bubbles: true,
          cancelable: true,
        })
      );

    // Cadangan: setelah dilepas, animasi drop harus selesai dalam sekejap.
    // Bila item masih "terangkat" (mis. event `transitionend` tidak pernah muncul
    // karena transisi dimatikan), selesaikan paksa agar tidak lengket.
    let settleTimer = null;
    const settleAfterRelease = () => {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        if (mouseHeld) return;
        const el = document.querySelector(
          ".board--dragging, .custom__card--dragging"
        );
        if (!el) return;
        el.dispatchEvent(
          new TransitionEvent("transitionend", {
            propertyName: "transform",
            bubbles: true,
          })
        );
        // Masih tersangkut? batalkan (kembali ke posisi awal)
        settleTimer = setTimeout(() => {
          if (isDragging()) cancelDrag();
        }, 600);
      }, 1200);
    };

    const onDown = (e) => {
      clearTimeout(settleTimer); // drag baru dimulai: batalkan cadangan lama
      if (e.button === 0) mouseHeld = true;
    };
    const onUp = () => {
      mouseHeld = false;
      settleAfterRelease();
    };
    const onMove = (e) => {
      // Hanya untuk drag yang dimulai dengan mouse (bukan sentuhan)
      if (mouseHeld && e.buttons === 0) {
        mouseHeld = false;
        if (isDragging()) cancelDrag();
      }
    };
    const onNativeDragStart = (e) => {
      if (e.target?.closest?.(".App")) e.preventDefault();
    };

    window.addEventListener("mousedown", onDown, true);
    window.addEventListener("mouseup", onUp, true);
    window.addEventListener("mousemove", onMove, true);
    const onTouchStart = () => clearTimeout(settleTimer);
    window.addEventListener("touchstart", onTouchStart, true);
    window.addEventListener("touchend", settleAfterRelease, true);
    window.addEventListener("touchcancel", settleAfterRelease, true);
    document.addEventListener("dragstart", onNativeDragStart);
    return () => {
      window.removeEventListener("mousedown", onDown, true);
      window.removeEventListener("mouseup", onUp, true);
      window.removeEventListener("mousemove", onMove, true);
      window.removeEventListener("touchstart", onTouchStart, true);
      window.removeEventListener("touchend", settleAfterRelease, true);
      window.removeEventListener("touchcancel", settleAfterRelease, true);
      clearTimeout(settleTimer);
      document.removeEventListener("dragstart", onNativeDragStart);
    };
  }, []);
}
