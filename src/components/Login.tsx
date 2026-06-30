"use client";

import { useState } from "react";

interface Props {
  onLogin: () => void;
}

function getInitialState() {
  if (typeof window === "undefined") return { id: "", password: "", remember: false };
  const savedId = localStorage.getItem("kb_login_id");
  const savedPass = localStorage.getItem("kb_login_pass");
  if (savedId && savedPass) {
    return { id: savedId, password: savedPass, remember: true };
  }
  return { id: "", password: "", remember: false };
}

export default function Login({ onLogin }: Props) {
  const [id, setId] = useState(() => getInitialState().id);
  const [password, setPassword] = useState(() => getInitialState().password);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(() => getInitialState().remember);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (id === "KHERWAL BAZAAR" && password === "9583252256") {
      if (remember) {
        localStorage.setItem("kb_login_id", id);
        localStorage.setItem("kb_login_pass", password);
      } else {
        localStorage.removeItem("kb_login_id");
        localStorage.removeItem("kb_login_pass");
      }
      onLogin();
    } else {
      setError("Invalid ID or Password");
      setId("");
      setPassword("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-blue-600 p-3 rounded-xl">
            <i className="fa-solid fa-cart-shopping text-white text-2xl"></i>
          </div>
        </div>
        <h2 className="text-center text-xl font-extrabold text-blue-900 uppercase tracking-wider mb-1">
          Kherwal Bazaar
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">Sale Management System</p>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">ID</label>
            <input
              type="text"
              placeholder="Enter ID"
              value={id}
              onChange={(e) => { setId(e.target.value); setError(""); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Save ID & Password</span>
          </label>

          {error && (
            <p className="text-red-500 text-sm font-medium text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition"
          >
            <i className="fa-solid fa-right-to-bracket mr-2"></i>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
