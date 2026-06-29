"use client";

import { useState, useRef, useEffect } from "react";

interface Sale {
  firebaseKey?: string;
  id: number;
  dateTime: string;
  productName: string;
  mrp: number;
  saleAmount: number;
  discount: number;
  paymentMode: string;
  status: "PENDING" | "COMPLETED";
  billId: string | null;
  createdAt: string;
  checkedOutAt?: string;
}

interface Props {
  sales: Sale[];
  onDelete: (firebaseKey: string) => void;
  onEdit: (sale: Sale) => void;
  isEditing: boolean;
  onCheckout: (customId?: string) => void;
}

function ActionMenu({
  sale,
  onDelete,
  onEdit,
}: {
  sale: Sale;
  onDelete: (firebaseKey: string) => void;
  onEdit: (sale: Sale) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceRight = window.innerWidth - rect.right;
      const spaceBottom = window.innerHeight - rect.bottom;

      const style: React.CSSProperties = { position: "fixed", width: "160px", zIndex: 50 };

      if (spaceBottom > 120) {
        style.top = rect.bottom + 4;
      } else {
        style.bottom = window.innerHeight - rect.top + 4;
      }

      if (spaceRight > 180) {
        style.left = rect.left;
      } else {
        style.left = rect.left - 160;
      }

      setMenuStyle(style);
    }
    setOpen(!open);
  };

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <button
        ref={btnRef}
        onClick={toggleMenu}
        className={`p-1 rounded-md transition ${open ? "bg-gray-200 text-gray-700" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}
      >
        <i className="fa-solid fa-ellipsis-vertical"></i>
      </button>

      {open && (
        <div style={menuStyle} className="bg-white rounded-lg shadow-lg border border-gray-100 py-1">
          <button
            onClick={() => { setOpen(false); onEdit(sale); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50 transition"
          >
            <i className="fa-regular fa-pen-to-square text-amber-500 w-4"></i>
            Edit
          </button>
          <hr className="my-1 border-gray-100" />
          <button
            onClick={() => { setOpen(false); if (sale.firebaseKey) onDelete(sale.firebaseKey); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
          >
            <i className="fa-regular fa-trash-can w-4"></i>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function SaleTable({ sales, onDelete, onEdit, isEditing, onCheckout }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const totalMRP = sales.reduce((sum, s) => sum + s.mrp, 0);
  const totalSaleAmount = sales.reduce((sum, s) => sum + s.saleAmount, 0);
  const totalDiscount = sales.reduce((sum, s) => sum + s.discount, 0);
  const totalProducts = sales.length;

  const paymentBadge = (mode: string) => {
    const styles: Record<string, string> = {
      Cash: "bg-green-100 text-green-700",
      UPI: "bg-purple-100 text-purple-700",
      Card: "bg-blue-100 text-blue-700",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[mode] || ""}`}>
        {mode}
      </span>
    );
  };

  return (
    <section className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition ${isEditing ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5 gap-4">
        <h3 className="text-md font-extrabold text-blue-900 uppercase tracking-wider">
          Current Cart
        </h3>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <i className="fa-solid fa-indian-rupee-sign text-blue-600"></i>
            <span className="text-sm font-bold text-blue-700 uppercase">Total MRP :</span>
            <span className="text-xl font-black text-blue-900">₹ {totalMRP.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            <i className="fa-solid fa-chart-line text-green-600"></i>
            <span className="text-sm font-bold text-green-700 uppercase">Sale Amount :</span>
            <span className="text-xl font-black text-green-900">₹ {totalSaleAmount.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
            <i className="fa-solid fa-percent text-amber-600"></i>
            <span className="text-sm font-bold text-amber-700 uppercase">Discount :</span>
            <span className="text-xl font-black text-amber-900">₹ {totalDiscount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-bold uppercase">
              <th className="py-3 px-4 bg-slate-100 text-slate-700 w-12 text-center">SL No.</th>
              <th className="py-3 px-4 bg-indigo-100 text-indigo-700">Product Name</th>
              <th className="py-3 px-4 bg-red-100 text-red-700">MRP (₹)</th>
              <th className="py-3 px-4 bg-emerald-100 text-emerald-700">Sale Amount (₹)</th>
              <th className="py-3 px-4 bg-amber-100 text-amber-700">Discount (₹)</th>
              <th className="py-3 px-4 bg-purple-100 text-purple-700 text-center">Payment Mode</th>
              <th className="py-3 px-4 bg-pink-100 text-pink-700">Date & Time</th>
              <th className="py-3 px-4 bg-slate-100 text-slate-700 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-50 font-medium">
            {sales.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400">
                  No items in cart. Add a sale to get started.
                </td>
              </tr>
            ) : (
              sales.map((sale, index) => (
                <tr key={sale.firebaseKey || sale.id} className="hover:bg-slate-50/40 transition">
                  <td className="py-2 px-4 text-center text-gray-500 font-medium">{index + 1}</td>
                  <td className="py-2 px-4 font-medium text-indigo-700">{sale.productName}</td>
                  <td className="py-2 px-4 font-semibold text-base text-red-600">{sale.mrp.toFixed(2)}</td>
                  <td className="py-2 px-4 font-semibold text-base text-emerald-600">{sale.saleAmount.toFixed(2)}</td>
                  <td className="py-2 px-4 text-amber-600 font-medium">{sale.discount.toFixed(2)}</td>
                  <td className="py-2 px-4 text-center">{paymentBadge(sale.paymentMode)}</td>
                  <td className="py-2 px-4 text-purple-600 whitespace-nowrap">{sale.dateTime}</td>
                  <td className="py-2 px-4 text-center">
                    <ActionMenu sale={sale} onDelete={onDelete} onEdit={onEdit} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setShowConfirm(true)}
          disabled={sales.length === 0}
          className={`text-white font-bold py-3 px-8 rounded-lg transition flex items-center gap-2 ${sales.length === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/10"}`}
        >
          <i className="fa-solid fa-check-double"></i>
          <span>CHECK OUT</span>
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-receipt text-blue-600"></i>
              </div>
              <h4 className="font-bold text-gray-900">Confirm Checkout</h4>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              You are about to checkout <strong>{sales.length} item{sales.length > 1 ? "s" : ""}</strong> from the current cart.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              A bill will be generated and all items will be moved to <strong>Bill History</strong>.
            </p>
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Customer Name / Mobile <span className="text-gray-400 normal-case">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Rakesh / 9876543210"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowConfirm(false); setCustomerName(""); }}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowConfirm(false); onCheckout(customerName || undefined); setCustomerName(""); }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition"
              >
                <i className="fa-solid fa-check-double mr-1"></i>
                Yes, Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
