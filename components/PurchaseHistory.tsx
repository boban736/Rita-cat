"use client";

import { useState, useEffect } from "react";
import type { Purchase } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Moscow",
  });
}

export default function PurchaseHistory() {
  const [open, setOpen] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    if (loaded) return;
    const res = await fetch("/api/purchases");
    if (res.ok) setPurchases(await res.json());
    setLoaded(true);
  }

  useEffect(() => {
    if (open) load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-sm font-medium text-gray-600">История закупок</span>
        <span className="text-gray-400 text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-gray-100">
          {purchases.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">Закупок нет</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {purchases.map((p) => (
                <li key={p.id} className="flex justify-between px-5 py-3 text-sm">
                  <span className="text-gray-500">{formatDate(p.purchased_at)}</span>
                  <span className="font-medium text-gray-800">{p.amount_grams} г</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
