import React, { useState, useEffect, useRef } from "react";
import {
  AlignLeft,
  Edit2,
  CheckSquare,
  Clock,
  CreditCard,
  Tag,
  Trash,
  Trash2,
  X,
} from "react-feather";
import { Editable, Modal } from "@/components/ui";
import "./CardDetails.css";
import { v4 as uuidv4 } from "uuid";
import Label from "../Label";
import DatePicker from "../DatePicker";
import DueBadge from "../DueBadge";
import { formatDue } from "@/utils/date";
import { LABEL_COLORS } from "@/constants";

export default function CardDetails(props) {
  const [values, setValues] = useState(() => ({
    ...props.card,
    tags: (props.card.tags || []).map((t) =>
      t.id ? t : { ...t, id: uuidv4() }
    ),
  }));
  const [input, setInput] = useState(false);
  const [text, setText] = useState(values.title);
  const [labelShow, setLabelShow] = useState(false);
  const [editTag, setEditTag] = useState(null); // label yang sedang diedit
  const [dateShow, setDateShow] = useState(false);
  const [desc, setDesc] = useState(props.card.description || "");
  const setDueDate = (value) => setValues((v) => ({ ...v, dueDate: value }));

  const addTask = (value) => {
    setValues((v) => ({
      ...v,
      task: [...v.task, { id: uuidv4(), task: value, completed: false }],
    }));
  };

  const removeTask = (id) => {
    setValues((v) => ({ ...v, task: v.task.filter((item) => item.id !== id) }));
  };

  const deleteAllTask = () => {
    setValues((v) => ({ ...v, task: [] }));
  };

  const updateTask = (id) => {
    setValues((v) => ({
      ...v,
      task: v.task.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    }));
  };
  const updateTitle = (value) => {
    setValues((v) => ({ ...v, title: value }));
  };

  const calculatePercent = () => {
    const totalTask = values.task.length;
    const completedTask = values.task.filter(
      (item) => item.completed === true
    ).length;

    return Math.floor((completedTask * 100) / totalTask) || 0;
  };

  // Hapus / ubah label lewat useBoards (satu operasi, bisa diurungkan)
  const removeTag = (id, applyAll = false) =>
    props.labelTools?.change({
      cardId: values.id,
      tagId: id,
      next: null,
      applyAll,
    });

  const addTag = (value, color) => {
    setValues((v) => ({
      ...v,
      tags: [...v.tags, { id: uuidv4(), tagName: value, color }],
    }));
  };

  const updateTag = (id, name, color, applyAll = false) =>
    props.labelTools?.change({
      cardId: values.id,
      tagId: id,
      next: { tagName: name, color },
      applyAll,
    });

  const commitDescription = () => {
    if (desc !== (values.description || ""))
      setValues((v) => ({ ...v, description: desc }));
  };

  const commitTitle = () => {
    setInput(false);
    const next = text.trim();
    if (next === "") setText(values.title);
    else updateTitle(next);
  };

  const handelClickListner = (e) => {
    if (e.code === "Enter" && input) commitTitle();
  };

  useEffect(() => {
    document.addEventListener("keypress", handelClickListner);
    return () => {
      document.removeEventListener("keypress", handelClickListner);
    };
  });
  useEffect(() => {
    if (props.updateCard) props.updateCard(props.bid, values.id, values);
  }, [values]);

  // Modal ditutup (Esc, klik latar, dsb.) saat deskripsi/judul masih diketik:
  // simpan dulu agar ketikan tidak hilang.
  const latest = useRef(null);
  latest.current = { values, desc, text, input };
  useEffect(
    () => () => {
      const { values: v, desc: d, text: t, input: editing } = latest.current;
      const next = { ...v };
      let changed = false;
      if (d !== (v.description || "")) {
        next.description = d;
        changed = true;
      }
      if (editing && t.trim() && t.trim() !== v.title) {
        next.title = t.trim();
        changed = true;
      }
      if (changed && props.updateCard) props.updateCard(props.bid, v.id, next);
    },
    []
  );

  // Label bisa berubah dari luar (edit di semua kartu / urungkan): sinkronkan ke salinan lokal
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (props.card.tags && props.card.tags !== values.tags)
      setValues((v) => ({ ...v, tags: props.card.tags }));
  }, [props.card.tags]);

  const percent = calculatePercent();

  return (
    <Modal onClose={props.onClose}>
      <div className="cd">
        <header className="cd__header">
          <CreditCard className="icon__md cd__header-icon" />
          {input ? (
            <input
              className="cd__title-input"
              autoFocus
              value={text}
              aria-label="Judul kartu"
              onChange={(e) => setText(e.target.value)}
              onBlur={commitTitle}
            />
          ) : (
            <h2
              className="cd__title"
              title="Klik untuk mengubah judul"
              onClick={() => setInput(true)}
            >
              {values.title}
            </h2>
          )}
          <button
            type="button"
            className="icon__btn cd__close"
            aria-label="Tutup"
            onClick={() => props.onClose(false)}
          >
            <X size={20} />
          </button>
        </header>

        <div className="cd__body">
          <div className="cd__main">
            {values.dueDate && (
              <section>
                <h3 className="cd__heading">Tenggat</h3>
                <DueBadge
                  date={values.dueDate}
                  showStatus
                  onClick={() => setDateShow(true)}
                />
              </section>
            )}

            <section>
              <h3 className="cd__heading">Label</h3>
              <div className="cd__labels">
                {values.tags.length !== 0 ? (
                  values.tags.map((item) => (
                    <span
                      key={item.id || item.tagName}
                      className="cd__label"
                      style={{ backgroundColor: item.color }}
                    >
                      <button
                        type="button"
                        className="cd__label-edit"
                        title="Klik untuk mengedit label"
                        aria-label={`Edit label ${item.tagName}`}
                        onClick={() => setEditTag(item)}
                      >
                        <span className="cd__label-text">{item.tagName}</span>
                        <Edit2 size={11} className="cd__label-pencil" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Hapus label ${item.tagName}`}
                        onClick={() => removeTag(item.id)}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="cd__muted">Belum ada label</span>
                )}
              </div>
            </section>

            <section>
              <h3 className="cd__heading cd__heading--icon">
                <AlignLeft className="icon__md" /> Deskripsi
              </h3>
              <textarea
                className="cd__desc"
                value={desc}
                rows={3}
                placeholder="Tambahkan deskripsi yang lebih detail…"
                aria-label="Deskripsi kartu"
                onChange={(e) => setDesc(e.target.value)}
                onBlur={commitDescription}
              />
            </section>

            <section>
              <div className="cd__row">
                <h3 className="cd__heading cd__heading--icon">
                  <CheckSquare className="icon__md" /> Checklist
                </h3>
                {values.task.length !== 0 && (
                  <button
                    type="button"
                    className="cd__btn cd__btn--ghost"
                    onClick={() => deleteAllTask()}
                  >
                    Hapus semua tugas
                  </button>
                )}
              </div>

              <div className="cd__progress">
                <span className="cd__progress-pct">{percent}%</span>
                <div
                  className="cd__progress-track"
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div
                    className="cd__progress-bar"
                    style={{ width: percent + "%" }}
                  />
                </div>
              </div>

              <ul className="cd__tasks">
                {values.task.map((item) => (
                  <li key={item.id} className="task__list">
                    <input
                      id={`t-${item.id}`}
                      className="task__checkbox"
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {
                        updateTask(item.id);
                      }}
                    />
                    <label
                      htmlFor={`t-${item.id}`}
                      className={`task__text ${
                        item.completed === true ? "strike-through" : ""
                      }`}
                    >
                      {item.task}
                    </label>
                    <button
                      type="button"
                      className="icon__btn task__del"
                      aria-label="Hapus tugas"
                      onClick={() => {
                        removeTask(item.id);
                      }}
                    >
                      <Trash size={16} />
                    </button>
                  </li>
                ))}
              </ul>

              <Editable
                parentClass={"task__editable"}
                name={"Tambah tugas"}
                btnName={"Tambah tugas"}
                placeholder={"Tulis tugas…"}
                onSubmit={addTask}
              />
            </section>
          </div>

          <aside className="cd__side">
            <h3 className="cd__heading">Tambahkan ke kartu</h3>
            <div className="cd__actions">
              <button
                type="button"
                className="cd__btn"
                onClick={() => setLabelShow(true)}
              >
                <Tag size={15} /> Tambah label
              </button>
              <button
                type="button"
                className="cd__btn"
                onClick={() => setDateShow(true)}
              >
                <Clock size={15} />
                {values.dueDate ? formatDue(values.dueDate) : "Tenggat"}
              </button>
              <button
                type="button"
                className="cd__btn cd__btn--danger"
                onClick={() => props.removeCard(props.bid, values.id)}
              >
                <Trash2 size={15} /> Hapus kartu
              </button>
            </div>
          </aside>
        </div>

        {dateShow && (
          <DatePicker
            value={values.dueDate}
            onSave={setDueDate}
            onClose={setDateShow}
          />
        )}

        {editTag && (
          <Label
            color={LABEL_COLORS}
            tag={editTag}
            otherCount={props.labelTools?.countOthers(editTag, values.id) || 0}
            tags={values.tags}
            onSave={updateTag}
            onDelete={removeTag}
            onClose={() => setEditTag(null)}
          />
        )}

        {labelShow && (
          <Label
            color={LABEL_COLORS}
            addTag={addTag}
            tags={values.tags}
            onClose={setLabelShow}
          />
        )}
      </div>
    </Modal>
  );
}
