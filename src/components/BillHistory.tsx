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

interface BillGroup {
  billId: string;
  items: Sale[];
  totalMRP: number;
  totalSaleAmount: number;
  totalDiscount: number;
  totalProfit: number;
  date: string;
  itemCount: number;
}

interface Props {
  completedSales: Sale[];
  onViewBill: (sales: Sale[]) => void;
  onDeleteBill: (billId: string) => void;
}

function BillActionMenu({
  onView,
  onDelete,
}: {
  onView: () => void;
  onDelete: () => void;
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
            onClick={() => { setOpen(false); onView(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50 transition"
          >
            <i className="fa-regular fa-eye text-blue-500 w-4"></i>
            View
          </button>
          <hr className="my-1 border-gray-100" />
          <button
            onClick={() => { setOpen(false); onDelete(); }}
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

export default function BillHistory({ completedSales, onViewBill, onDeleteBill }: Props) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const billGroups: BillGroup[] = [];
  const billMap = new Map<string, Sale[]>();

  for (const sale of completedSales) {
    if (sale.billId) {
      const existing = billMap.get(sale.billId) || [];
      existing.push(sale);
      billMap.set(sale.billId, existing);
    }
  }

  billMap.forEach((items, billId) => {
    items.sort((a, b) => a.id - b.id);
    billGroups.push({
      billId,
      items,
      totalMRP: items.reduce((sum, s) => sum + s.mrp, 0),
      totalSaleAmount: items.reduce((sum, s) => sum + s.saleAmount, 0),
      totalDiscount: items.reduce((sum, s) => sum + s.discount, 0),
      totalProfit: items.reduce((sum, s) => sum + (s.saleAmount - s.mrp / 2), 0),
      date: items[0].dateTime,
      itemCount: items.length,
    });
  });

  billGroups.sort((a, b) => b.items[0].id - a.items[0].id);

  const totalRevenue = billGroups.reduce((sum, b) => sum + b.totalSaleAmount, 0);
  const totalProfit = billGroups.reduce((sum, b) => sum + b.totalProfit, 0);
  const totalBills = billGroups.length;

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5 gap-4">
        <h3 className="text-md font-extrabold text-blue-900 uppercase tracking-wider">
          Bill History ({totalBills} bills)
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            <i className="fa-solid fa-chart-line text-green-600"></i>
            <span className="text-sm font-bold text-green-700 uppercase">Total Profit :</span>
            <span className="text-xl font-black text-green-900">₹ {totalProfit.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <i className="fa-solid fa-indian-rupee-sign text-blue-600"></i>
            <span className="text-sm font-bold text-blue-700 uppercase">Total Revenue :</span>
            <span className="text-xl font-black text-blue-900">₹ {totalRevenue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-bold uppercase">
              <th className="py-3 px-4 bg-slate-100 text-slate-700">Bill ID</th>
              <th className="py-3 px-4 bg-pink-100 text-pink-700">Date</th>
              <th className="py-3 px-4 bg-indigo-100 text-indigo-700 text-center">Items</th>
              <th className="py-3 px-4 bg-red-100 text-red-700">Total MRP (₹)</th>
              <th className="py-3 px-4 bg-emerald-100 text-emerald-700">Total Sale (₹)</th>
              <th className="py-3 px-4 bg-amber-100 text-amber-700">Discount (₹)</th>
              <th className="py-3 px-4 bg-green-100 text-green-700">Profit (₹)</th>
              <th className="py-3 px-4 bg-slate-100 text-slate-700 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-50 font-medium">
            {billGroups.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400">
                  No bills found. Complete a checkout to see history.
                </td>
              </tr>
            ) : (
              billGroups.map((bill) => (
                <tr key={bill.billId} className="hover:bg-slate-50/40 transition">
                  <td className="py-2 px-4 font-mono font-bold text-slate-700">{bill.billId}</td>
                  <td className="py-2 px-4 text-pink-600 whitespace-nowrap">{bill.date}</td>
                  <td className="py-2 px-4 text-center text-indigo-700 font-bold">{bill.itemCount}</td>
                  <td className="py-2 px-4 font-semibold text-red-600">₹ {bill.totalMRP.toFixed(2)}</td>
                  <td className="py-2 px-4 font-semibold text-emerald-600">₹ {bill.totalSaleAmount.toFixed(2)}</td>
                  <td className="py-2 px-4 text-amber-600">₹ {bill.totalDiscount.toFixed(2)}</td>
                  <td className="py-2 px-4 font-bold text-green-600">₹ {bill.totalProfit.toFixed(2)}</td>
                  <td className="py-2 px-4 text-center">
                    <BillActionMenu
                      onView={() => onViewBill(bill.items)}
                      onDelete={() => setConfirmDelete(bill.billId)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-triangle-exclamation text-red-600"></i>
              </div>
              <h4 className="font-bold text-gray-900">Delete Bill?</h4>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              This will permanently delete bill <strong>{confirmDelete}</strong> and all its items. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={() => { onDeleteBill(confirmDelete); setConfirmDelete(null); }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
