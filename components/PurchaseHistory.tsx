"use client";

import { useState, useEffect } from "react";
import type { Purchase } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Moscow",
  });
}

export default function PurchaseHistory() {
  const [open, setOpen] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open || loaded) return;
    fetch("/api/purchases")
      .then((r) => r.json())
      .then((data: Purchase[]) => { setPurchases(data); setLoaded(true); });
  }, [open, loaded]);

  return (
    <div style={{
      background: "var(--surface)",
      borderRadius: 18,
      boxShadow: "0 2px 14px var(--sh)",
      overflow: "hidden",
      animation: "fadeUp 0.45s cubic-bezier(0.34, 1.2, 0.64, 1) 0.15s both",
    }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          fontWeight: 800,
          fontSize: 15.5,
          color: "var(--text)",
          padding: "16px 18px",
        }}
      >
        История закупок
        <span style={{
          transform: open ? "rotate(180deg)" : "rotate(0)",
          transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          color: "var(--text3)",
          fontSize: 11,
          display: "inline-block",
        }}>▼</span>
      </button>

      <div style={{
        overflow: "hidden",
        maxHeight: open ? 200 : 0,
        transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <div style={{ padding: "0 18px 12px" }}>
          {!loaded ? (
            <div style={{ textAlign: "center", fontSize: 13, color: "var(--text3)", padding: "12px 0" }}>
              Загружаем...
            </div>
          ) : purchases.length === 0 ? (
            <div style={{ textAlign: "center", fontSize: 13, color: "var(--text3)", padding: "12px 0" }}>
              Закупок нет
            </div>
          ) : (
            purchases.map((p, i) => (
              <div key={p.id} style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 14,
                fontSize: 13,
                color: "var(--text2)",
                padding: "7px 0",
                borderTop: i === 0 ? "1px solid var(--border)" : "1px solid var(--border)",
                fontWeight: 600,
              }}>
                <span>{formatDate(p.purchased_at)}</span>
                <span>{p.amount_grams} г</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
