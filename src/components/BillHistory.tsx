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

  // Weekly profits
  interface WeekGroup { label: string; profit: number; revenue: number; bills: number; startDate: Date; }
  const weekMap = new Map<string, WeekGroup>();

  for (const bill of billGroups) {
    const d = new Date(bill.items[0].createdAt || bill.items[0].checkedOutAt || Date.now());
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - d.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const key = startOfWeek.toISOString().slice(0, 10);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const existing = weekMap.get(key);
    if (existing) {
      existing.profit += bill.totalProfit;
      existing.revenue += bill.totalSaleAmount;
      existing.bills += 1;
    } else {
      const startStr = startOfWeek.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      const endStr = endOfWeek.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      weekMap.set(key, {
        label: `${startStr} - ${endStr}`,
        profit: bill.totalProfit,
        revenue: bill.totalSaleAmount,
        bills: 1,
        startDate: startOfWeek,
      });
    }
  }

  const weeklyProfits = Array.from(weekMap.values()).sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
      {/* Summary + Weekly Profits */}
      <div className="mb-5">
        <h3 className="text-sm sm:text-md font-extrabold text-blue-900 uppercase tracking-wider mb-3">
          Bill History ({totalBills} bills)
        </h3>
        <div className="flex gap-2 sm:gap-3">
          <div className="flex-1 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 min-w-0">
            <i className="fa-solid fa-chart-line text-green-600 text-xs sm:text-sm hidden sm:block shrink-0"></i>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-bold text-green-700 uppercase truncate">Total Profit</p>
              <p className="text-base sm:text-xl font-black text-green-900">₹{totalProfit.toFixed(0)}</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 min-w-0">
            <i className="fa-solid fa-indian-rupee-sign text-blue-600 text-xs sm:text-sm hidden sm:block shrink-0"></i>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-bold text-blue-700 uppercase truncate">Total Revenue</p>
              <p className="text-base sm:text-xl font-black text-blue-900">₹{totalRevenue.toFixed(0)}</p>
            </div>
          </div>
          {weeklyProfits.map((week, i) => (
            <div
              key={i}
              className="flex-1 flex items-center gap-2 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg px-3 py-2 min-w-0"
            >
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-bold text-green-700 uppercase truncate">{week.label}</p>
                <p className="text-base sm:text-xl font-black text-green-900">₹{week.profit.toFixed(0)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: Card Layout */}
      <div className="md:hidden space-y-3">
        {billGroups.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">
            No bills found. Complete a checkout to see history.
          </div>
        ) : (
          billGroups.map((bill) => (
            <div
              key={bill.billId}
              className="bg-slate-50 rounded-xl p-3 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-mono font-bold text-slate-700 truncate">{bill.billId}</p>
                  <p className="text-[8px] sm:text-[10px] text-gray-400 mt-0.5">{bill.date}</p>
                </div>
                <BillActionMenu
                  onView={() => onViewBill(bill.items)}
                  onDelete={() => setConfirmDelete(bill.billId)}
                />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] sm:text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Items</span>
                  <span className="font-bold text-indigo-700">{bill.itemCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">MRP</span>
                  <span className="font-bold text-red-600">₹{bill.totalMRP.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sale</span>
                  <span className="font-bold text-emerald-600">₹{bill.totalSaleAmount.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span className="font-bold text-amber-600">₹{bill.totalDiscount.toFixed(0)}</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
                <span className="text-[8px] sm:text-[10px] text-gray-400">{bill.itemCount} item{bill.itemCount > 1 ? "s" : ""}</span>
                <span className="text-[10px] sm:text-xs font-black text-green-600">Profit: ₹{bill.totalProfit.toFixed(0)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: Table Layout */}
      <div className="hidden md:block overflow-x-auto">
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

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <i className="fa-solid fa-triangle-exclamation text-red-600"></i>
              </div>
              <h4 className="font-bold text-gray-900">Delete Bill?</h4>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              This will permanently delete bill <strong className="break-all">{confirmDelete}</strong> and all its items. This action cannot be undone.
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
