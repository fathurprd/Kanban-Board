import React, { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { AlignLeft, CheckSquare, Move, Check } from "react-feather";
import { Tag, Modal } from "@/components/ui";
import DueBadge from "../DueBadge";
import "./Card.css";
import CardDetails from "../CardDetails";
const Card = (props) => {
  const [modalShow, setModalShow] = useState(false);
  const [moveShow, setMoveShow] = useState(false);
  const due = props.card.dueDate;
  const allDone =
    props.card.task.length > 0 && props.card.task.every((t) => t.completed);

  return (
    <Draggable
      key={props.id.toString()}
      draggableId={props.id.toString()}
      index={props.index}
      isDragDisabled={props.dragDisabled}
    >
      {(provided, snapshot) => (
        <>
          {modalShow && (
            <CardDetails
              updateCard={props.updateCard}
              onClose={setModalShow}
              card={props.card}
              bid={props.bid}
              removeCard={props.removeCard}
              labelTools={props.labelTools}
            />
          )}

          {moveShow && (
            <Modal onClose={setMoveShow}>
              <div className="move__sheet">
                <h3 className="move__title">Pindahkan kartu ke…</h3>
                <p className="move__card">{props.title}</p>
                <ul className="move__list">
                  {props.boardList?.map((b) => {
                    const current = b.id === props.bid;
                    return (
                      <li key={b.id}>
                        <button
                          type="button"
                          className="move__item"
                          disabled={current}
                          onClick={() => {
                            setMoveShow(false);
                            props.moveCardTo(props.id, props.bid, b.id);
                          }}
                        >
                          <span>{b.boardName || "Tanpa nama"}</span>
                          {current ? (
                            <span className="move__here">
                              <Check size={14} /> Di sini
                            </span>
                          ) : (
                            <span className="move__count">{b.card.length}</span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <button
                  type="button"
                  className="move__cancel"
                  onClick={() => setMoveShow(false)}
                >
                  Batal
                </button>
              </div>
            </Modal>
          )}

          <div
            className={`custom__card${
              snapshot.isDragging ? " custom__card--dragging" : ""
            }`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target === e.currentTarget)
                setModalShow(true);
            }}
            onClick={() => {
              setModalShow(true);
            }}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
          >
            <div className="card__text">
              <p>{props.title}</p>
              {props.moveCardTo && (
                <button
                  type="button"
                  className="card__move"
                  aria-label="Pindahkan kartu"
                  title="Pindahkan ke board lain"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMoveShow(true);
                  }}
                >
                  <Move size={14} />
                </button>
              )}
            </div>

            {props.tags?.length > 0 && (
              <div className="card__tags">
                {props.tags.map((item, index) => (
                  <Tag key={item.id || index} tagName={item.tagName} color={item.color} />
                ))}
              </div>
            )}

            {(props.card.task.length !== 0 ||
              due ||
              props.card.description) && (
              <div className="card__footer">
                <DueBadge date={due} done={allDone} />
                {props.card.description && (
                  <span className="card__desc-icon" title="Punya deskripsi">
                    <AlignLeft />
                  </span>
                )}
                {props.card.task.length !== 0 && (
                  <div className="task">
                    <CheckSquare />
                    <span>
                      {`${
                        props.card.task.filter((item) => item.completed).length
                      } / ${props.card.task.length}`}
                    </span>
                  </div>
                )}
              </div>
            )}

            {provided.placeholder}
          </div>
        </>
      )}
    </Draggable>
  );
};

export default Card;
