"use client";

import { useState } from "react";

interface Props {
  onAdded: () => void;
}

const PRESETS = [1, 2, 3];

export default function TreatWidget({ onAdded }: Props) {
  const [loading, setLoading] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  async function addTreat(amount: number) {
    setLoading(amount);
    const res = await fetch("/api/feedings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount_grams: amount,
        food_type: "treat",
        fed_at: new Date().toISOString(),
      }),
    });
    if (res.ok) onAdded();
    setLoading(null);
  }

  async function handleCustom(e: React.FormEvent) {
    e.preventDefault();
    const val = Number(custom);
    if (!val || val <= 0) return;
    await addTreat(val);
    setCustom("");
    setShowCustom(false);
  }

  return (
    <div style={{
      background: "var(--surface)",
      borderRadius: 18,
      padding: "16px 18px",
      boxShadow: "0 2px 14px var(--sh)",
      animation: "fadeUp 0.45s cubic-bezier(0.34, 1.2, 0.64, 1) 0.2s both",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🐟</span>
          <span style={{ fontWeight: 800, fontSize: 15.5, color: "var(--text)" }}>Вкусняшка</span>
        </div>
        <button
          onClick={() => setShowCustom((v) => !v)}
          style={{
            background: showCustom ? "var(--green-bg)" : "var(--bg2)",
            border: "none",
            borderRadius: 10,
            width: 32,
            height: 32,
            cursor: "pointer",
            color: "var(--green)",
            fontSize: 20,
            fontWeight: 300,
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: showCustom ? "rotate(45deg)" : "rotate(0)",
            transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s",
          }}
        >+</button>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {PRESETS.map((n) => (
          <button
            key={n}
            onClick={() => addTreat(n)}
            disabled={loading !== null}
            style={{
              flex: 1,
              background: loading === n ? "var(--green)" : "var(--bg2)",
              border: "2px solid",
              borderColor: loading === n ? "var(--green)" : "var(--border)",
              borderRadius: 14,
              padding: "10px 0",
              fontFamily: "inherit",
              fontWeight: 800,
              fontSize: 14,
              color: loading === n ? "var(--accent-contrast)" : "var(--text)",
              cursor: loading !== null ? "default" : "pointer",
              opacity: loading !== null && loading !== n ? 0.5 : 1,
              transition: "background 0.15s, border-color 0.15s, transform 0.12s",
            }}
            onMouseDown={(e) => { if (!loading) e.currentTarget.style.transform = "scale(0.93)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            onTouchStart={(e) => { if (!loading) e.currentTarget.style.transform = "scale(0.93)"; }}
            onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {n} шт.
          </button>
        ))}
      </div>

      <div style={{
        overflow: "hidden",
        maxHeight: showCustom ? 70 : 0,
        transition: "max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <form onSubmit={handleCustom} style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input
            type="number"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            min="0.1"
            step="0.1"
            placeholder="Своё кол-во (шт.)"
            style={{
              flex: 1,
              background: "var(--field)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "9px 14px",
              fontSize: 13,
              color: "var(--text)",
              fontFamily: "inherit",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={!custom || loading !== null}
            style={{
              background: "var(--green)",
              border: "none",
              borderRadius: 12,
              padding: "9px 16px",
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: 13,
              color: "var(--accent-contrast)",
              cursor: !custom ? "default" : "pointer",
              opacity: !custom ? 0.5 : 1,
            }}
          >
            Дать
          </button>
        </form>
      </div>
    </div>
  );
}
