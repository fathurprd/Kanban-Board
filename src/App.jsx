import { useState } from "react";
import { flushSync } from "react-dom";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { Plus } from "react-feather";
import { Navbar, Toolbar, DataMenu } from "@/components/layout";
import { Board } from "@/components/board";
import { Editable, Toast, ConfirmDialog } from "@/components/ui";
import useBoards from "@/hooks/useBoards";
import useFilters from "@/hooks/useFilters";
import useTheme from "@/hooks/useTheme";
import useDragGuard from "@/hooks/useDragGuard";
import useLockHorizontalSwipe from "@/hooks/useLockHorizontalSwipe";
import useViewportWidth from "@/hooks/useViewportWidth";
import useMediaQuery from "@/hooks/useMediaQuery";
import { LIST_MODE_QUERY } from "@/constants";
import { countCards, downloadBackup, parseBackup } from "@/utils/backup";
import "@/styles/app.css";

function App() {
  const { theme, toggleTheme } = useTheme();

  // Notifikasi (toast) — dipakai untuk "Urungkan" dan pesan impor
  const [toast, setToast] = useState(null);
  const notify = (n) => setToast({ id: Date.now(), ...n });

  // Data hasil impor yang menunggu konfirmasi
  const [pendingImport, setPendingImport] = useState(null);

  // Layar kosong: true saat pengguna memilih "Buat board sendiri"
  const [creating, setCreating] = useState(false);

  useViewportWidth();
  // HP: board ditumpuk ke bawah sebagai daftar (bisa dilipat)
  const isPhone = useMediaQuery(LIST_MODE_QUERY);
  // Perangkat sentuh (HP & tablet): board diseret lewat ikon pegangan khusus
  const isTouch = useMediaQuery("(pointer: coarse)");
  useDragGuard();
  useLockHorizontalSwipe();

  const {
    boards,
    addBoard,
    removeBoard,
    renameBoard,
    addCard,
    removeCard,
    updateCard,
    moveCard,
    moveCardTo,
    moveBoard,
    replaceBoards,
    labelTools,
  } = useBoards({ notify });

  const f = useFilters(boards);
  const totalCards = countCards(boards);

  // HP: saat menyeret board, semua board dilipat sementara agar mudah dipindah
  const [boardDragging, setBoardDragging] = useState(false);

  // Menjalankan perubahan yang mengubah tinggi daftar, lalu menggeser halaman
  // seperlunya supaya board yang sedang dipegang tetap di posisi layar yang sama
  // (jari tidak "kehilangan" board-nya).
  const keepInPlace = (draggableId, change) => {
    const find = () =>
      document.querySelector(
        `[data-rfd-draggable-id="${draggableId}"], [data-rbd-draggable-id="${draggableId}"]`
      );
    const before = find()?.getBoundingClientRect().top;
    flushSync(change);
    const after = find()?.getBoundingClientRect().top;
    if (before != null && after != null && Math.abs(after - before) > 1)
      window.scrollBy(0, after - before);
  };

  const onBeforeCapture = ({ draggableId }) => {
    if (!isPhone || !draggableId.startsWith("board-")) return;
    keepInPlace(draggableId, () => setBoardDragging(true));
  };

  const onDragEnd = ({ source, destination, type, draggableId }) => {
    if (type === "BOARD") {
      const reorder = () => {
        if (destination && source.index !== destination.index)
          moveBoard(source.index, destination.index);
      };
      if (isPhone)
        keepInPlace(draggableId, () => {
          setBoardDragging(false);
          reorder();
        });
      else reorder();
      return;
    }
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;
    moveCard(source, destination);
  };

  const startDefaultBoards = () =>
    ["📝 Akan dikerjakan", "🚧 Sedang dikerjakan", "✅ Selesai"].forEach(
      addBoard
    );

  const handleExport = () => {
    downloadBackup(boards);
    notify({
      message: `Backup diunduh (${boards.length} board, ${totalCards} kartu)`,
    });
  };

  const handleImportFile = async (file) => {
    try {
      const parsed = parseBackup(await file.text());
      setPendingImport(parsed);
    } catch (err) {
      notify({ message: err.message, variant: "error" });
    }
  };

  return (
    <DragDropContext
      onBeforeCapture={onBeforeCapture}
      onDragEnd={onDragEnd}
      autoScrollerOptions={{
        startFromPercentage: 0.2,
        maxScrollAtPercentage: 0.05,
        maxPixelScroll: 22,
      }}
    >
      <div className="App" data-theme={theme}>
        <Navbar
          theme={theme}
          switchTheme={toggleTheme}
          subtitle={
            boards.length > 0
              ? `${boards.length} board · ${totalCards} kartu`
              : null
          }
        >
          <DataMenu
            canExport={boards.length > 0}
            onExport={handleExport}
            onImportFile={handleImportFile}
          />
        </Navbar>

        {/* Pencarian & filter baru berguna setelah ada board */}
        {boards.length > 0 && (
          <Toolbar
            filters={f.filters}
            labels={f.labels}
            filtering={f.filtering}
            matchedCount={f.matchedCount}
            totalCount={totalCards}
            onQuery={f.setQuery}
            onDue={f.setDue}
            onToggleLabel={f.toggleLabel}
            onReset={f.reset}
          />
        )}

        <div className="app_outer">
          <Droppable
            droppableId="boards"
            direction={isPhone ? "vertical" : "horizontal"}
            type="BOARD"
          >
            {(provided) => (
              <div
                className="app_boards"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {boards.map((item, index) => (
                  <Board
                    key={item.id}
                    id={item.id}
                    index={index}
                    name={item.boardName}
                    card={f.filtering ? item.card.filter(f.matches) : item.card}
                    totalCards={item.card.length}
                    filtering={f.filtering}
                    setName={renameBoard}
                    addCard={addCard}
                    removeCard={removeCard}
                    removeBoard={removeBoard}
                    labelTools={labelTools}
                    updateCard={updateCard}
                    moveCardTo={moveCardTo}
                    boardList={boards}
                    gripHandle={isPhone || isTouch}
                    dragCollapse={isPhone && boardDragging}
                  />
                ))}
                {provided.placeholder}
                {boards.length === 0 && !creating && (
                  <div className="app__empty">
                    <h2 className="app__empty-title">
                      Atur pekerjaanmu dalam kolom
                    </h2>
                    <p className="app__empty-text">
                      Buat board untuk setiap tahap pekerjaan, isi dengan
                      kartu, lalu geser kartunya maju seiring progres.
                    </p>
                    <button
                      type="button"
                      className="app__empty-primary"
                      onClick={startDefaultBoards}
                    >
                      Mulai dengan Akan dikerjakan, Sedang dikerjakan, Selesai
                    </button>
                    <button
                      type="button"
                      className="app__empty-secondary"
                      onClick={() => setCreating(true)}
                    >
                      <Plus size={18} /> Buat board sendiri
                    </button>
                  </div>
                )}
                {(boards.length > 0 || creating) && (
                  <div className="add__board_wrap">
                    <Editable
                      class={"add__board"}
                      name={"Tambah board"}
                      btnName={"Tambah board"}
                      handler={creating}
                      setHandler={setCreating}
                      onSubmit={(title) => {
                        addBoard(title);
                        setCreating(false);
                      }}
                      placeholder={"Tulis nama board…"}
                    />
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </div>

        {pendingImport && (
          <ConfirmDialog
            title="Impor data?"
            message={`File berisi ${
              pendingImport.length
            } board dan ${countCards(
              pendingImport
            )} kartu. Data yang ada sekarang akan diganti. Kamu masih bisa mengurungkannya sesaat setelah impor.`}
            confirmLabel="Ganti data"
            onConfirm={() =>
              replaceBoards(pendingImport, "Data berhasil diimpor")
            }
            onClose={() => setPendingImport(null)}
          />
        )}

        {toast && (
          <Toast
            key={toast.id}
            message={toast.message}
            variant={toast.variant}
            onAction={toast.undo}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </DragDropContext>
  );
}

export default App;
