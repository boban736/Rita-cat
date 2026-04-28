"use client";

import { useCountUp } from "@/lib/hooks";
import type { StockInfo } from "@/lib/types";

interface Props {
  stock: StockInfo;
  onPurchase: (e: React.MouseEvent) => void;
}

export default function StockWidget({ stock, onPurchase }: Props) {
  const { remaining_grams, days_left } = stock;
  const stockN = useCountUp(remaining_grams);

  function press(e: React.MouseEvent) {
    const el = e.currentTarget as HTMLButtonElement;
    el.style.transform = "scale(0.92)";
    setTimeout(() => (el.style.transform = "scale(1)"), 180);
    onPurchase(e);
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, var(--green-l), oklch(0.92 0.08 145))",
      borderRadius: 18,
      padding: "16px 18px",
      boxShadow: "0 2px 14px var(--sh)",
      animation: "fadeUp 0.45s cubic-bezier(0.34, 1.2, 0.64, 1) 0.1s both",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.3, textTransform: "uppercase", color: "var(--text3)", marginBottom: 3 }}>
            Запас корма
          </div>
          <div style={{ fontSize: 30, fontWeight: 900, color: "var(--green)", lineHeight: 1.1, marginTop: 2 }}>
            {stockN}<span style={{ fontSize: 14 }}>г</span>
          </div>
          <div style={{ fontSize: 12, color: "oklch(0.48 0.1 145)", marginTop: 3, fontWeight: 700 }}>
            ~{days_left} дней
          </div>
        </div>
        <button
          onClick={press}
          style={{
            background: "var(--green)",
            color: "#fff",
            border: "none",
            borderRadius: 14,
            padding: "11px 20px",
            fontFamily: "inherit",
            fontWeight: 800,
            fontSize: 14.5,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 4px 16px oklch(0.52 0.18 145 / 0.4)",
            transition: "transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          📦 Закупил
        </button>
      </div>
    </div>
  );
}
