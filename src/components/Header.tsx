"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  onNavigate?: (tab: "cart" | "history") => void;
  activeTab?: "cart" | "history";
  onLogout?: () => void;
}

export default function Header({ onNavigate, activeTab, onLogout }: Props) {
  const [time, setTime] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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
              <hr className="my-1 border-gray-100" />
              <button
                onClick={() => { setShowLogoutConfirm(true); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <i className="fa-solid fa-right-from-bracket w-4"></i>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-right-from-bracket text-red-600"></i>
              </div>
              <h4 className="font-bold text-gray-900">Confirm Logout</h4>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to logout? You will need to login again to access the system.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowLogoutConfirm(false); onLogout?.(); }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition"
              >
                <i className="fa-solid fa-right-from-bracket mr-1"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
