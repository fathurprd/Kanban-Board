import React from "react";
import { Moon, Sun } from "react-feather";
import "./Navbar.css";

export default function Navbar({ theme, switchTheme, subtitle, children }) {
  const isDark = theme === "dark";
  return (
    <header className="navbar">
      <div className="navbar__brand">
        <div className="navbar__text">
          <h1 className="navbar__title">Kanban Board</h1>
          {subtitle && <p className="navbar__sub">{subtitle}</p>}
        </div>
      </div>
      <div className="navbar__actions">
        {children}
        <button
          type="button"
          className="theme__toggle"
          onClick={switchTheme}
          role="switch"
          aria-checked={isDark}
          aria-label={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
          title={isDark ? "Mode terang" : "Mode gelap"}
        >
          <Sun size={14} className="theme__icon theme__icon--sun" />
          <Moon size={14} className="theme__icon theme__icon--moon" />
          <span className="theme__thumb" />
        </button>
      </div>
    </header>
  );
}
