"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  onNavigate?: (tab: "cart" | "history") => void;
  activeTab?: "cart" | "history";
  onLogout?: () => void;
}

export default function Header({ onNavigate, activeTab, onLogout }: Props) {
  const SESSION_MINUTES = 30;
  const [remaining, setRemaining] = useState(SESSION_MINUTES * 60);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onLogout?.();
          return 0;
        }
        if (prev === 300) setShowWarning(true);
        return prev - 1;
      });
    }, 1000);
    return () => { clearInterval(interval); };
  }, [onLogout]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timerDisplay = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const isLow = remaining <= 300;

  return (
    <header className="bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 text-white px-4 sm:px-6 py-3 sm:py-4 shadow-md">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block bg-white/10 p-2 rounded-lg">
            <i className="fa-solid fa-cart-shopping text-2xl"></i>
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide uppercase">
            Kherwal Bazaar
          </h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 text-sm font-medium">
          {/* Session Timer */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-md whitespace-nowrap ${isLow ? "bg-red-500 animate-pulse" : "bg-white/10 border border-white/20"}`}>
            <i className={`fa-solid fa-clock ${isLow ? "text-white" : "text-white/70"}`}></i>
            <span className={`digital-timer text-xl sm:text-2xl leading-none ${isLow ? "text-white" : "text-red-400"}`}>
              {timerDisplay}
            </span>
          </div>

          {/* Profile icon + dropdown */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
            >
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-indigo-900 font-bold text-sm">
                BT
              </div>
              <span className="hidden sm:inline text-sm">Balakram Tudu</span>
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
      </div>

      {/* Session Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                <i className="fa-solid fa-triangle-exclamation text-amber-600"></i>
              </div>
              <h4 className="font-bold text-gray-900">Session Expiring Soon</h4>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Your session will expire in <strong>5 minutes</strong>. Save your work before auto-logout.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowWarning(false)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
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
