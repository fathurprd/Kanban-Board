import React, { useEffect } from "react";
import { LIST_MODE_QUERY } from "@/constants";
import "./Modal.css";
const Modal = (props) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") props.onClose(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Di HP halaman bisa digulir; kunci selama modal terbuka agar latar tidak ikut bergeser
  useEffect(() => {
    if (!window.matchMedia(LIST_MODE_QUERY).matches) return;
    const prev = document.body.style.overflowY;
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = prev;
    };
  }, []);

  return (
    <div className="custom__modal" onClick={() => props.onClose(false)}>
      <div
        className="modal__content"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        {props.children}
      </div>
    </div>
  );
};

export default Modal;
