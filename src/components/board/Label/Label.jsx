import React, { useRef, useState } from "react";
import { Check, AlertCircle, CheckCircle, Trash2 } from "react-feather";
import { Popover } from "@/components/ui";
import "./Label.css";

export default function Label(props) {
  const editing = props.tag;
  const input = useRef();
  const [selectedColor, setSelectedColor] = useState(editing?.color || "");
  const [label, setLabel] = useState(editing?.tagName || "");
  // notice: { type: "error" | "success", message, fields: ["name"|"color"] }
  const [notice, setNotice] = useState(null);
  const [applyAll, setApplyAll] = useState(false);
  const otherCount = props.otherCount || 0;

  const clearNotice = () => notice && setNotice(null);
  const invalid = (field) =>
    notice?.type === "error" && notice.fields?.includes(field);

  const fail = (message, fields) => {
    setNotice({ type: "error", message, fields });
    if (fields.includes("name")) input.current?.focus();
  };

  const create = () => {
    const name = label.trim();

    if (!name && !selectedColor)
      return fail("Isi nama label dan pilih warna dulu.", ["name", "color"]);
    if (!name)
      return fail("Harus buat label dulu — isi nama labelnya.", ["name"]);
    if (!selectedColor)
      return fail("Pilih warna label terlebih dahulu.", ["color"]);

    const duplicate = props.tags.some(
      (t) =>
        t.id !== editing?.id &&
        (t.tagName || "").trim().toLowerCase() === name.toLowerCase() &&
        t.color === selectedColor
    );
    if (duplicate)
      return fail("Label dengan nama dan warna yang sama sudah ada.", [
        "name",
        "color",
      ]);

    if (editing) {
      props.onSave(editing.id, name, selectedColor, applyAll);
      props.onClose(false);
      return;
    }

    props.addTag(name, selectedColor);
    setSelectedColor("");
    setLabel("");
    if (input.current) input.current.value = "";
    setNotice({
      type: "success",
      message: `Label "${name}" berhasil ditambahkan.`,
    });
    input.current?.focus();
  };

  return (
    <Popover title={editing ? "Edit label" : "Label"} onClose={props.onClose}>
      <p className="label__caption">Nama</p>
      <div className="label__input">
        <input
          type="text"
          ref={input}
          autoFocus
          defaultValue={label}
          placeholder="Nama label"
          aria-invalid={invalid("name")}
          className={invalid("name") ? "is-invalid" : ""}
          onChange={(e) => {
            setLabel(e.target.value);
            clearNotice();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") create();
          }}
        />
      </div>

      <p className="label__caption">Pilih warna</p>
      <div
        className={`color__palette${invalid("color") ? " is-invalid" : ""}`}
        role="group"
        aria-label="Pilih warna label"
      >
        {props.color.map((item) => (
          <button
            type="button"
            key={item}
            aria-label={`Warna ${item}`}
            aria-pressed={selectedColor === item}
            className="color__swatch"
            style={{ backgroundColor: item }}
            onClick={() => {
              setSelectedColor(item);
              clearNotice();
            }}
          >
            {selectedColor === item ? <Check size={18} /> : null}
          </button>
        ))}
      </div>

      {editing && otherCount > 0 && (
        <label className="label__applyall">
          <input
            type="checkbox"
            checked={applyAll}
            onChange={(e) => setApplyAll(e.target.checked)}
          />
          <span>
            Terapkan juga ke <b>{otherCount}</b> kartu lain yang memakai label
            ini
          </span>
        </label>
      )}

      <div
        className={`label__notice${
          notice ? ` label__notice--${notice.type}` : ""
        }`}
        role={notice?.type === "error" ? "alert" : "status"}
        aria-live="polite"
      >
        {notice && (
          <>
            {notice.type === "error" ? (
              <AlertCircle size={16} />
            ) : (
              <CheckCircle size={16} />
            )}
            <span>{notice.message}</span>
          </>
        )}
      </div>

      <button type="button" className="create__btn" onClick={create}>
        {editing ? "Simpan perubahan" : "Create"}
      </button>
      {editing && (
        <button
          type="button"
          className="label__delete"
          onClick={() => {
            props.onDelete(editing.id, applyAll);
            props.onClose(false);
          }}
        >
          <Trash2 size={15} />{" "}
          {applyAll && otherCount > 0
            ? "Hapus dari semua kartu"
            : "Hapus label"}
        </button>
      )}
    </Popover>
  );
}
