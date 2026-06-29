"use client";

interface Sale {
  firebaseKey?: string;
  id: number;
  dateTime: string;
  productName: string;
  mrp: number;
  saleAmount: number;
  discount: number;
  paymentMode: string;
  billId: string | null;
  createdAt: string;
  checkedOutAt?: string;
}

interface Props {
  sales: Sale[];
  onClose: () => void;
}

export default function BillView({ sales, onClose }: Props) {
  const billId = sales[0]?.billId || "N/A";
  const date = sales[0]?.dateTime || "";
  const paymentMode = sales[0]?.paymentMode || "";
  const totalMRP = sales.reduce((sum, s) => sum + s.mrp, 0);
  const totalSaleAmount = sales.reduce((sum, s) => sum + s.saleAmount, 0);
  const totalDiscount = sales.reduce((sum, s) => sum + s.discount, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">KHERWAL BAZAAR</h2>
              <p className="text-sm text-white/70">Sale Management System</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-xl transition"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs font-bold text-slate-500 uppercase">Bill ID</p>
              <p className="font-mono font-bold text-slate-800">{billId}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs font-bold text-slate-500 uppercase">Date & Time</p>
              <p className="font-semibold text-slate-800">{date}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs font-bold text-slate-500 uppercase">Payment Mode</p>
              <p className="font-semibold text-slate-800">{paymentMode}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs font-bold text-slate-500 uppercase">Total Items</p>
              <p className="font-semibold text-slate-800">{sales.length}</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse mb-6">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold uppercase">
                <th className="py-2 px-3 bg-indigo-100 text-indigo-700">#</th>
                <th className="py-2 px-3 bg-indigo-100 text-indigo-700">Product</th>
                <th className="py-2 px-3 bg-red-100 text-red-700">MRP</th>
                <th className="py-2 px-3 bg-emerald-100 text-emerald-700">Sale</th>
                <th className="py-2 px-3 bg-amber-100 text-amber-700">Discount</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {sales.map((sale, i) => (
                <tr key={sale.firebaseKey || sale.id}>
                  <td className="py-2 px-3 text-gray-500">{i + 1}</td>
                  <td className="py-2 px-3 font-medium text-indigo-700">{sale.productName}</td>
                  <td className="py-2 px-3 text-red-600">₹ {sale.mrp.toFixed(2)}</td>
                  <td className="py-2 px-3 text-emerald-600">₹ {sale.saleAmount.toFixed(2)}</td>
                  <td className="py-2 px-3 text-amber-600">₹ {sale.discount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
            <div className="flex justify-between">
              <span className="font-bold text-blue-700">Total MRP:</span>
              <span className="font-black text-blue-900">₹ {totalMRP.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-emerald-700">Total Sale Amount:</span>
              <span className="font-black text-emerald-900">₹ {totalSaleAmount.toFixed(2)}</span>
            </div>
            <hr className="border-green-300" />
            <div className="flex justify-between">
              <span className="font-bold text-amber-700">Total Discount:</span>
              <span className="font-black text-amber-900">₹ {totalDiscount.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
