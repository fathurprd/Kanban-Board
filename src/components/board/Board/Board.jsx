import React, { useEffect, useState } from "react";
import Card from "../Card";
import "./Board.css";
import { MoreHorizontal, Trash2, ChevronDown } from "react-feather";
import { Editable, Dropdown } from "@/components/ui";
import { Draggable, Droppable } from "@hello-pangea/dnd";
export default function Board(props) {
  const [show, setShow] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  // Hanya berlaku di HP (CSS): lipat/buka isi board
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Enter") setShow(false);
    };
    document.addEventListener("keypress", onKey);
    return () => document.removeEventListener("keypress", onKey);
  }, []);

  return (
    <Draggable
      draggableId={`board-${props.id}`}
      index={props.index}
    >
      {(dragProvided, dragSnapshot) => (
        <section
          className={`board${
            dragSnapshot.isDragging ? " board--dragging" : ""
          }${
            collapsed || props.dragCollapse ? " board--collapsed" : ""
          }`}
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
        >
          {/* Desktop/tablet: seluruh header adalah pegangan seret.
              Layar sentuh (HP/tablet): hanya ikon pegangan di kiri, supaya ketukan di judul,
              tombol lipat, atau titik tiga tidak pernah memulai seret. */}
          <div
            className="board__top"
            {...(props.gripHandle ? {} : dragProvided.dragHandleProps)}
          >
            {props.gripHandle && (
              <span
                className="board__grip"
                role="button"
                aria-label="Tahan lalu seret untuk memindahkan board"
                {...dragProvided.dragHandleProps}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <circle cx="5.5" cy="3" r="1.4" />
                  <circle cx="10.5" cy="3" r="1.4" />
                  <circle cx="5.5" cy="8" r="1.4" />
                  <circle cx="10.5" cy="8" r="1.4" />
                  <circle cx="5.5" cy="13" r="1.4" />
                  <circle cx="10.5" cy="13" r="1.4" />
                </svg>
              </span>
            )}
            {show ? (
              <div className="board__title_wrap">
                <input
                  className="title__input"
                  type={"text"}
                  autoFocus
                  aria-label="Nama board"
                  onBlur={() => setShow(false)}
                  defaultValue={props.name}
                  onChange={(e) => {
                    props.setName(e.target.value, props.id);
                  }}
                />
              </div>
            ) : (
              <div className="board__title_wrap">
                <p
                  onClick={() => {
                    setShow(true);
                  }}
                  className="board__title"
                  title="Klik untuk mengganti nama"
                >
                  <span className="board__name">
                    {props?.name || "Board tanpa nama"}
                  </span>
                  <span className="total__cards">
                    {props.filtering
                      ? `${props.card?.length}/${props.totalCards}`
                      : props.card?.length}
                  </span>
                </p>
              </div>
            )}
            <button
              type="button"
              className="icon__btn board__fold"
              aria-label={collapsed ? "Buka board" : "Lipat board"}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((v) => !v)}
            >
              <ChevronDown size={18} />
            </button>
            <div className="board__menu">
              <button
                type="button"
                className="icon__btn"
                aria-label="Menu board"
                aria-haspopup="menu"
                onClick={() => {
                  setDropdown((v) => !v);
                }}
              >
                <MoreHorizontal size={18} />
              </button>
              {dropdown && (
                <Dropdown
                  class="board__dropdown"
                  onClose={() => {
                    setDropdown(false);
                  }}
                >
                  <button
                    type="button"
                    className="dropdown__item dropdown__item--danger"
                    onClick={() => props.removeBoard(props.id)}
                  >
                    <Trash2 size={15} /> Hapus board
                  </button>
                </Dropdown>
              )}
            </div>
          </div>
          <Droppable
            droppableId={props.id.toString()}
            isDropDisabled={props.filtering}
          >
            {(provided) => (
              <div
                className="board__cards"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {props.card?.map((items, index) => (
                  <Card
                    bid={props.id}
                    id={items.id}
                    index={index}
                    key={items.id}
                    title={items.title}
                    tags={items.tags}
                    updateCard={props.updateCard}
                    removeCard={props.removeCard}
                    moveCardTo={props.moveCardTo}
                    boardList={props.boardList}
                    labelTools={props.labelTools}
                    card={items}
                    dragDisabled={props.filtering}
                  />
                ))}
                {provided.placeholder}
                {props.filtering && props.card.length === 0 && (
                  <p className="board__nomatch">Tidak ada kartu yang cocok</p>
                )}
                {!props.filtering && props.card?.length === 0 && (
                  <p className="board__empty">
                    Belum ada kartu. Tambahkan tugas pertamamu di bawah.
                  </p>
                )}
              </div>
            )}
          </Droppable>
          {!props.filtering && (
            <div className="board__footer">
              <Editable
                name={"Tambah kartu"}
                btnName={"Tambah kartu"}
                placeholder={"Tulis judul kartu…"}
                onSubmit={(value) => props.addCard(value, props.id)}
              />
            </div>
          )}
        </section>
      )}
    </Draggable>
  );
}
