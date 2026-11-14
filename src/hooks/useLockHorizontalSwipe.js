import { useEffect } from "react";

// Area yang tidak boleh menggeser halaman ke samping (navbar & toolbar)
const LOCKED = ".App > .navbar, .App > .toolbar";

/**
 * Cadangan untuk `touch-action: pan-y` di CSS: sebagian browser/tablet tidak
 * selalu menghormatinya untuk scroll halaman. Di sini geseran yang dimulai di
 * navbar/toolbar dan dominan horizontal dibatalkan lewat JS:
 *  - jari (touch)
 *  - mouse/trackpad: scroll horizontal (dua jari di trackpad, Shift + roda)
 * Geser vertikal (menggulir halaman di HP) tidak disentuh.
 */
export default function useLockHorizontalSwipe() {
  useEffect(() => {
    let start = null;
    let axis = null;

    const onStart = (e) => {
      const t = e.target;
      const inLocked = t?.closest?.(LOCKED);
      const isField = t?.closest?.("input, textarea, select");
      if (e.touches.length !== 1 || !inLocked || isField) {
        start = null;
        return;
      }
      start = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      axis = null;
    };

    const onMove = (e) => {
      if (!start || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - start.x;
      const dy = e.touches[0].clientY - start.y;
      if (!axis) {
        if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
        axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      if (axis === "x" && e.cancelable) e.preventDefault();
    };

    const onWheel = (e) => {
      if (!e.target?.closest?.(LOCKED)) return;
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;
      if (horizontal && e.cancelable) e.preventDefault();
    };

    const onEnd = () => {
      start = null;
      axis = null;
    };

    document.addEventListener("touchstart", onStart, { passive: true, capture: true });
    document.addEventListener("touchmove", onMove, { passive: false, capture: true });
    document.addEventListener("touchend", onEnd, true);
    document.addEventListener("touchcancel", onEnd, true);
    document.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => {
      document.removeEventListener("wheel", onWheel, true);
      document.removeEventListener("touchstart", onStart, true);
      document.removeEventListener("touchmove", onMove, true);
      document.removeEventListener("touchend", onEnd, true);
      document.removeEventListener("touchcancel", onEnd, true);
    };
  }, []);
}
