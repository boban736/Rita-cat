"use client";

import { useState, useEffect } from "react";
import type { MonthlySpending } from "@/lib/types";

function formatMonth(ym: string) {
  const [year, month] = ym.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
}

export default function SpendingStats() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<MonthlySpending[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || loaded) return;
    setLoading(true);
    fetch("/api/stats/spending")
      .then((r) => r.json())
      .then((d: MonthlySpending[]) => { setData(d); setLoaded(true); setLoading(false); });
  }, [open, loaded]);

  const hasData = data.some((m) => m.total > 0);

  return (
    <div style={{
      background: "var(--surface)",
      borderRadius: 18,
      boxShadow: "0 2px 14px var(--sh)",
      overflow: "hidden",
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>📊</span>
          <span>Расходы по месяцам</span>
        </div>
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
        maxHeight: open ? 500 : 0,
        transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <div style={{ padding: "0 18px 14px" }}>
          {loading ? (
            <div style={{ textAlign: "center", fontSize: 13, color: "var(--text3)", padding: "12px 0" }}>
              Загружаем...
            </div>
          ) : !hasData ? (
            <div style={{ textAlign: "center", fontSize: 13, color: "var(--text3)", padding: "12px 0" }}>
              Данных нет — добавь цены к закупкам или записям
            </div>
          ) : (
            data.filter((m) => m.total > 0).map((m, i) => (
              <div key={m.month} style={{
                padding: "10px 0",
                borderTop: i === 0 ? "1px solid var(--border)" : "1px solid var(--border)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", textTransform: "capitalize" }}>
                    {formatMonth(m.month)}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "var(--green)" }}>
                    {m.total} MDL
                  </span>
                </div>
                <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--text3)", flexWrap: "wrap" }}>
                  {m.food > 0 && <span>🥣 Корм: {m.food} MDL</span>}
                  {m.health > 0 && <span>💊 Здоровье: {m.health} MDL</span>}
                  {m.supply > 0 && <span>🧸 Вещи: {m.supply} MDL</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
