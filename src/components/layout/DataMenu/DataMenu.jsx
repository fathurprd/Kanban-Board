import React, { useRef, useState } from "react";
import { Database, Download, Upload } from "react-feather";
import { Dropdown } from "@/components/ui";
import "./DataMenu.css";

/**
 * Menu Data di navbar: ekspor & impor backup JSON.
 * Ekspor hanya muncul jika sudah ada board (`canExport`); saat kosong
 * hanya impor yang ditampilkan.
 */
export default function DataMenu({ onExport, onImportFile, canExport = false }) {
  const [open, setOpen] = useState(false);
  const fileRef = useRef(null);

  return (
    <div className="datamenu">
      <button
        type="button"
        className="datamenu__btn"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Backup data"
        onClick={() => setOpen((v) => !v)}
      >
        <Database size={16} />
        <span>Data</span>
      </button>

      {open && (
        <Dropdown class="datamenu__dropdown" onClose={() => setOpen(false)}>
          {canExport && (
            <button
              type="button"
              className="dropdown__item"
              onClick={() => {
                setOpen(false);
                onExport();
              }}
            >
              <Download size={15} /> Ekspor data (JSON)
            </button>
          )}
          <button
            type="button"
            className="dropdown__item"
            onClick={() => {
              setOpen(false);
              fileRef.current?.click();
            }}
          >
            <Upload size={15} /> Impor data (JSON)
          </button>
        </Dropdown>
      )}

      {/* Selalu ter-render agar dialog file tetap bekerja setelah menu menutup */}
      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onImportFile(file);
        }}
      />
    </div>
  );
}
