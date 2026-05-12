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

  async function handleDelete(id: string) {
    const res = await fetch(`/api/purchases/${id}`, { method: "DELETE" });
    if (res.ok) setPurchases((prev) => prev.filter((p) => p.id !== id));
  }

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
        maxHeight: open ? 300 : 0,
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
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                color: "var(--text2)",
                padding: "7px 0",
                borderTop: i === 0 ? "1px solid var(--border)" : "1px solid var(--border)",
                fontWeight: 600,
              }}>
                <span style={{ flex: 1 }}>{formatDate(p.purchased_at)}</span>
                <span>{p.amount_grams} г</span>
                {p.price > 0 && (
                  <span style={{ color: "var(--text3)" }}>{p.price} MDL</span>
                )}
                <button
                  onClick={() => handleDelete(p.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    opacity: 0.4,
                    padding: 2,
                    lineHeight: 1,
                    color: "var(--text)",
                  }}
                  title="Удалить"
                >✕</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
