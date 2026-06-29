"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  onNavigate?: (tab: "cart" | "history") => void;
  activeTab?: "cart" | "history";
}

export default function Header({ onNavigate, activeTab }: Props) {
  const [time, setTime] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function update() {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 text-white px-6 py-4 flex flex-col md:flex-row justify-between items-center shadow-md gap-4 md:flex-nowrap">
      <div className="flex items-center gap-3">
        <div className="bg-white/10 p-2 rounded-lg">
          <i className="fa-solid fa-cart-shopping text-2xl"></i>
        </div>
        <h1 className="text-xl md:text-2xl font-bold tracking-wide uppercase">
          Kherwal Bazaar Sale Managements
        </h1>
      </div>

      <div className="flex items-center gap-6 text-sm font-medium">
        <div className="flex items-center bg-white px-3 py-0.5 rounded-md whitespace-nowrap">
          <span className="digital-timer text-red-600 text-3xl leading-none">{time}</span>
        </div>
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
          >
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-indigo-900 font-bold">
              BT
            </div>
            <span>Balakram Tudu</span>
            <i className={`fa-solid fa-chevron-down text-xs transition-transform ${menuOpen ? "rotate-180" : ""}`}></i>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1">
              <button
                onClick={() => { onNavigate?.("cart"); setMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition ${activeTab === "cart" ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-700 hover:bg-slate-50"}`}
              >
                <i className="fa-solid fa-cart-shopping w-4 text-blue-500"></i>
                Current Cart
              </button>
              <button
                onClick={() => { onNavigate?.("history"); setMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition ${activeTab === "history" ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-700 hover:bg-slate-50"}`}
              >
                <i className="fa-solid fa-clock-rotate-left w-4 text-amber-500"></i>
                Bill History
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
