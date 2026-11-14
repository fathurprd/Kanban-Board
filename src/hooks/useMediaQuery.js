import { useEffect, useState } from "react";

/** true bila media query cocok (mis. "(max-width: 640px)"); ikut berubah saat layar diputar/diubah. */
export default function useMediaQuery(query) {
  const get = () =>
    typeof window !== "undefined" && window.matchMedia(query).matches;
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}
