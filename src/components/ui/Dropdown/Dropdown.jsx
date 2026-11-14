import React, { useRef, useEffect } from "react";
import "./Dropdown.css";
const Dropdown = (props) => {
  const dropRef = useRef();
  const handleClick = (event) => {
    const root = dropRef.current;
    if (!root || !props.onClose) return;
    // Klik di dalam menu, atau di tombol pemicunya (saudara satu induk),
    // tidak dianggap "klik di luar" — tombol pemicu sendiri yang membuka/menutup.
    const scope = root.parentElement || root;
    if (!scope.contains(event.target)) props.onClose();
  };
  useEffect(() => {
    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  });
  return (
    <div ref={dropRef} className={`dropdown ${props.class ? props.class : ""}`}>
      {props.children}
    </div>
  );
};

export default Dropdown;
