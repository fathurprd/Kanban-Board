import React, { useRef, useState } from "react";
import { Plus, X } from "react-feather";
import "./Editable.css";

const Editable = (props) => {
  const [show, setShow] = useState(props?.handler || false);
  const [text, setText] = useState(props.defaultValue || "");
  const inputRef = useRef(null);

  const cancel = () => {
    setText(props.defaultValue || "");
    setShow(false);
    props.setHandler?.(false);
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) {
      // kosong: tutup form
      setShow(false);
      return;
    }
    setText("");
    props.onSubmit?.(value);
    // tetap terbuka supaya bisa menambah beberapa item berturut-turut
    inputRef.current?.focus();
  };

  return (
    <div className={`editable ${props.parentClass || ""}`}>
      {show ? (
        <form onSubmit={handleOnSubmit}>
          <div className={`editable__input ${props.class || ""}`}>
            <textarea
              placeholder={props.placeholder}
              ref={inputRef}
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleOnSubmit(e);
                } else if (e.key === "Escape") {
                  e.stopPropagation();
                  cancel();
                }
              }}
            />
            <div className="btn__control">
              <button className="add__btn" type="submit">
                {props.btnName || "Add"}
              </button>
              <X
                className="close"
                role="button"
                aria-label="Batal"
                onClick={cancel}
              />
            </div>
          </div>
        </form>
      ) : (
        <p
          onClick={() => {
            setShow(true);
          }}
        >
          {props.defaultValue === undefined ? <Plus /> : <></>}
          {props?.name || "Add"}
        </p>
      )}
    </div>
  );
};

export default Editable;
