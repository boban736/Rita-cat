"use client";

import type { Settings } from "@/lib/types";

interface Props {
  settings: Settings;
  onChanged: (s: Settings) => void;
}

function isToday(iso: string | null): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function WaterWidget({ settings, onChanged }: Props) {
  const changed = isToday(settings.water_changed_at);

  async function handleChange(e: React.MouseEvent) {
    const el = e.currentTarget as HTMLButtonElement;
    el.style.transform = "scale(0.92)";
    setTimeout(() => (el.style.transform = "scale(1)"), 180);

    const res = await fetch("/api/water", { method: "PUT" });
    if (res.ok) onChanged(await res.json());
  }

  return (
    <div style={{
      background: changed
        ? "linear-gradient(135deg, var(--blue-l), var(--surface2))"
        : "var(--surface)",
      borderRadius: 18,
      padding: "16px 18px",
      boxShadow: "0 2px 14px var(--sh)",
      transition: "background 0.5s ease",
      animation: "fadeUp 0.45s cubic-bezier(0.34, 1.2, 0.64, 1) 0.2s both",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.3, textTransform: "uppercase", color: "var(--text3)", marginBottom: 3 }}>
            Вода
          </div>
          <div style={{
            fontSize: 20,
            fontWeight: 800,
            marginTop: 4,
            color: changed ? "var(--blue)" : "var(--text3)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            💧 {changed ? "Сегодня" : "Не менялась"}
          </div>
        </div>
        <button
          onClick={handleChange}
          style={{
            background: changed ? "var(--blue-l)" : "var(--blue)",
            color: changed ? "var(--blue)" : "var(--accent-contrast)",
            border: "none",
            borderRadius: 14,
            padding: "11px 20px",
            fontFamily: "inherit",
            fontWeight: 800,
            fontSize: 14.5,
            cursor: "pointer",
            transition: "transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {changed ? "✓ Сменила" : "Сменить"}
        </button>
      </div>
    </div>
  );
}
