"use client";

import { useState, useEffect } from "react";
import { useCountUp } from "@/lib/hooks";

interface Props {
  eaten: number;
  limit: number;
  justFed?: boolean;
}

function Lbl({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.3, textTransform: "uppercase", color: "var(--text3)", marginBottom: 3 }}>
      {children}
    </div>
  );
}

export default function DryProgress({ eaten, limit, justFed }: Props) {
  const pct = Math.min((eaten / limit) * 100, 100);
  const remaining = Math.max(limit - eaten, 0);
  const barColor = pct >= 60 ? "var(--amber)" : "var(--green)";

  const fedN = useCountUp(eaten);
  const leftN = useCountUp(remaining);

  const [barGo, setBarGo] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setBarGo(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      background: justFed ? "linear-gradient(135deg, var(--green-l), var(--surface2))" : "var(--surface)",
      border: `1.5px solid ${justFed ? "oklch(0.7 0.15 145 / 0.4)" : "transparent"}`,
      borderRadius: 18,
      padding: "16px 18px",
      boxShadow: "0 2px 14px var(--sh)",
      transition: "background 0.7s ease",
      animation: "fadeUp 0.45s cubic-bezier(0.34, 1.2, 0.64, 1) 0.04s both",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <Lbl>Сухой корм сегодня</Lbl>
          <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginTop: 2 }}>
            <span style={{ fontSize: 38, fontWeight: 900, lineHeight: 1 }}>{fedN}</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text2)" }}>г</span>
            <span style={{ fontSize: 14, color: "var(--text3)" }}>/ {limit} г</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <Lbl>Осталось</Lbl>
          <div style={{ fontSize: 30, fontWeight: 900, color: "var(--green)", lineHeight: 1, marginTop: 2 }}>
            {leftN}<span style={{ fontSize: 13, fontWeight: 700 }}> г</span>
          </div>
        </div>
      </div>

      <div style={{ height: 10, background: "var(--border)", borderRadius: 99, overflow: "hidden", marginTop: 10 }}>
        <div style={{
          height: "100%",
          borderRadius: 99,
          background: pct >= 100 ? "var(--green)" : barColor,
          width: barGo ? `${Math.min(pct, 100)}%` : "0%",
          transition: "width 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
          position: "relative",
          overflow: "hidden",
        }}>
          {barGo && pct > 0 && (
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
              backgroundSize: "200%",
              animation: "shimmer 1.8s ease-in-out 1s 1",
            }} />
          )}
        </div>
      </div>

      {pct >= 100 && (
        <div style={{
          marginTop: 8,
          textAlign: "center",
          fontSize: 12.5,
          fontWeight: 800,
          color: "var(--green)",
          animation: "checkIn 0.5s ease both",
        }}>
          ✅ Дневная норма выполнена!
        </div>
      )}
    </div>
  );
}
