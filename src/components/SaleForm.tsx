"use client";

import { useState } from "react";

interface Sale {
  productName: string;
  mrp: number;
  saleAmount: number;
  paymentMode: string;
}

interface Props {
  onAddSale: (sale: Sale) => void;
  editingSale?: Sale | null;
  onUpdateSale?: (sale: Sale) => void;
  onCancelEdit?: () => void;
  productNames?: string[];
}

export default function SaleForm({ onAddSale, editingSale, onUpdateSale, onCancelEdit, productNames = [] }: Props) {
  const [productName, setProductName] = useState(editingSale?.productName || "");
  const [mrp, setMrp] = useState(editingSale?.mrp?.toString() || "");
  const [saleAmount, setSaleAmount] = useState(editingSale?.saleAmount?.toString() || "");
  const [paymentMode, setPaymentMode] = useState(editingSale?.paymentMode || "Cash");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const discount = Math.max(0, (parseFloat(mrp) || 0) - (parseFloat(saleAmount) || 0));

  const filteredSuggestions = productName
    ? productNames.filter((name) =>
        name.toLowerCase().includes(productName.toLowerCase())
      )
    : productNames;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mrp || !saleAmount) return;
    if (editingSale && onUpdateSale) {
      onUpdateSale({
        productName,
        mrp: parseFloat(mrp),
        saleAmount: parseFloat(saleAmount),
        paymentMode,
      });
    } else {
      onAddSale({
        productName,
        mrp: parseFloat(mrp),
        saleAmount: parseFloat(saleAmount),
        paymentMode,
      });
    }
    setProductName("");
    setMrp("");
    setSaleAmount("");
    setPaymentMode("Cash");
  };

  const handleCancel = () => {
    setProductName("");
    setMrp("");
    setSaleAmount("");
    setPaymentMode("Cash");
    onCancelEdit?.();
  };

  return (
    <section className="max-w-sm mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="flex items-center justify-center gap-2 text-indigo-900 font-bold text-xl uppercase tracking-wider mb-6">
        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm text-white ${editingSale ? "bg-amber-500" : "bg-blue-600"}`}>
          <i className={`fa-solid ${editingSale ? "fa-pen-to-square" : "fa-cart-shopping"}`}></i>
        </span>
        <h2>{editingSale ? "Edit Sale" : "Add New Sale"}</h2>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="relative">
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Product Name
          </label>
          <input
            type="text"
            placeholder="e.g., Men's Cotton Shirt"
            value={productName}
            onChange={(e) => { setProductName(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-32 overflow-y-auto">
              {filteredSuggestions.map((name, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={() => { setProductName(name); setShowSuggestions(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-indigo-50 text-gray-700 transition"
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              MRP
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-black text-3xl">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                min="0"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-3 text-3xl font-black focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Sale Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-black text-3xl">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                min="0"
                value={saleAmount}
                onChange={(e) => setSaleAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-3 text-3xl font-black focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Payment Mode
          </label>
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          >
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
          </select>
        </div>

        <div className="bg-green-50/60 border border-green-200/80 rounded-xl p-4 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-green-700 uppercase tracking-wide">
              Discount Price
            </p>
            <p className="text-3xl font-black text-green-600 mt-1">
              ₹ {discount.toFixed(2)}
            </p>
          </div>
          <div className="text-green-600 text-3xl opacity-80">
            <i className="fa-solid fa-percent bg-green-100 p-3 rounded-full"></i>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className={`flex-1 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 ${editingSale ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/10"}`}
          >
            <i className={`fa-solid text-sm ${editingSale ? "fa-check" : "fa-cart-shopping"}`}></i>
            <span>{editingSale ? "Update Sale" : "Add Sale"}</span>
          </button>
          {editingSale && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
