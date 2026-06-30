"use client";

import { useState, useEffect } from "react";
import { push, ref, onValue, remove, update } from "firebase/database";
import { database } from "@/firebase";
import Header from "@/components/Header";
import SaleForm from "@/components/SaleForm";
import SaleTable from "@/components/SaleTable";
import BillHistory from "@/components/BillHistory";
import BillView from "@/components/BillView";
import Login from "@/components/Login";

interface FirebaseSale {
  id: number;
  dateTime: string;
  productName: string;
  mrp: number;
  saleAmount: number;
  discount: number;
  paymentMode: string;
  status: string;
  billId: string | null;
  createdAt: string;
  checkedOutAt?: string;
}

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

function formatDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${date} ${time}`;
}

function generateBillId() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `KB-${date}-${random}`;
}

export default function Home() {
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [viewingBill, setViewingBill] = useState<Sale[] | null>(null);
  const [activeTab, setActiveTab] = useState<"cart" | "history">("cart");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (!database) return;
    const salesRef = ref(database, "sales");
    onValue(salesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loaded: Sale[] = Object.entries(data).map(([key, val]) => {
          const v = val as FirebaseSale;
          return {
          firebaseKey: key,
          id: v.id,
          dateTime: v.dateTime,
          productName: v.productName || "",
          mrp: v.mrp,
          saleAmount: v.saleAmount,
          discount: v.discount,
          paymentMode: v.paymentMode,
          status: (v.status || "PENDING") as "PENDING" | "COMPLETED",
          billId: v.billId || null,
          createdAt: v.createdAt || "",
          checkedOutAt: v.checkedOutAt || undefined,
        };
        });
        loaded.sort((a, b) => b.id - a.id);
        setAllSales(loaded);
      } else {
        setAllSales([]);
      }
    });
  }, []);

  const pendingSales = allSales.filter((s) => s.status === "PENDING");
  const completedSales = allSales.filter((s) => s.status === "COMPLETED");

  const handleAddSale = async (newSale: {
    productName: string;
    mrp: number;
    saleAmount: number;
    paymentMode: string;
  }) => {
    const discount = newSale.mrp - newSale.saleAmount;
    const sale = {
      id: Date.now(),
      dateTime: formatDateTime(),
      productName: newSale.productName || "Garments",
      mrp: newSale.mrp,
      saleAmount: newSale.saleAmount,
      discount,
      paymentMode: newSale.paymentMode,
      status: "PENDING",
      billId: null,
      createdAt: new Date().toISOString(),
    };

    try {
      if (database) {
        await push(ref(database, "sales"), sale);
      }
    } catch (error) {
      console.error("Failed to save sale to Firebase:", error);
    }
  };

  const handleDelete = async (firebaseKey: string) => {
    try {
      if (database) {
        await remove(ref(database, `sales/${firebaseKey}`));
      }
    } catch (error) {
      console.error("Failed to delete sale:", error);
    }
  };

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
  };

  const handleUpdateSale = async (updatedSale: {
    productName: string;
    mrp: number;
    saleAmount: number;
    paymentMode: string;
  }) => {
    if (!editingSale?.firebaseKey) return;
    const discount = updatedSale.mrp - updatedSale.saleAmount;
    try {
      if (database) {
        await update(ref(database, `sales/${editingSale.firebaseKey}`), {
          productName: updatedSale.productName || "Garments",
          mrp: updatedSale.mrp,
          saleAmount: updatedSale.saleAmount,
          discount,
          paymentMode: updatedSale.paymentMode,
        });
      }
      setEditingSale(null);
    } catch (error) {
      console.error("Failed to update sale:", error);
    }
  };

  const handleCheckout = async (customId?: string) => {
    if (pendingSales.length === 0) return;
    let billId: string;
    if (customId) {
      const now = new Date();
      const date = now.toISOString().slice(0, 10).replace(/-/g, "");
      const random = Math.floor(Math.random() * 9000) + 1000;
      billId = `${customId}-${date}-${random}`;
    } else {
      billId = generateBillId();
    }
    const now = new Date().toISOString();

    try {
      if (database) {
        const updates: Record<string, string | null> = {};
        for (const sale of pendingSales) {
          if (sale.firebaseKey) {
            updates[`sales/${sale.firebaseKey}/status`] = "COMPLETED";
            updates[`sales/${sale.firebaseKey}/billId`] = billId;
            updates[`sales/${sale.firebaseKey}/checkedOutAt`] = now;
          }
        }
        await update(ref(database), updates);
      }
    } catch (error) {
      console.error("Failed to checkout:", error);
    }
  };

  const handleDeleteBill = async (billId: string) => {
    try {
      if (database) {
        const billSales = allSales.filter((s) => s.billId === billId);
        const updates: Record<string, null> = {};
        for (const sale of billSales) {
          if (sale.firebaseKey) {
            updates[`sales/${sale.firebaseKey}`] = null;
          }
        }
        await update(ref(database), updates);
      }
    } catch (error) {
      console.error("Failed to delete bill:", error);
    }
  };

  const productNames = [...new Set(allSales.map((s) => s.productName).filter(Boolean))];

  return (
    <>
      {!isLoggedIn && <Login onLogin={() => setIsLoggedIn(true)} />}
      {isLoggedIn && (
        <>
          <Header onNavigate={setActiveTab} activeTab={activeTab} onLogout={() => setIsLoggedIn(false)} />
          <main className="max-w-7xl mx-auto px-4 mt-8 space-y-8">
            {activeTab === "cart" && (
              <>
                <SaleForm
                  onAddSale={handleAddSale}
                  editingSale={editingSale}
                  onUpdateSale={handleUpdateSale}
                  onCancelEdit={() => setEditingSale(null)}
                  productNames={productNames}
                />
                <SaleTable
                  sales={pendingSales}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  isEditing={!!editingSale}
                  onCheckout={handleCheckout}
                />
              </>
            )}

            {activeTab === "history" && (
              <BillHistory
                completedSales={completedSales}
                onViewBill={(sales) => setViewingBill(sales)}
                onDeleteBill={handleDeleteBill}
              />
            )}
          </main>

          {viewingBill && (
            <BillView sales={viewingBill} onClose={() => setViewingBill(null)} />
          )}
        </>
      )}
    </>
  );
}
