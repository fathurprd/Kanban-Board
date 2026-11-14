import { useEffect } from "react";

/**
 * Menyimpan lebar area terlihat (tanpa scrollbar) ke CSS variable `--vw`.
 * Dipakai navbar/toolbar yang menempel di kiri; `100vw` ikut menghitung
 * scrollbar sehingga di Windows sisi kanan navbar bisa terpotong.
 */
export default function useViewportWidth() {
  useEffect(() => {
    const root = document.documentElement;
    const update = () =>
      root.style.setProperty("--vw", `${root.clientWidth}px`);
    update();
    window.addEventListener("resize", update);
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    ro?.observe(root);
    return () => {
      window.removeEventListener("resize", update);
      ro?.disconnect();
    };
  }, []);
}
