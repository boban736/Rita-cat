"use client";

import { useState } from "react";
import type { Feeding } from "@/lib/types";
import { FOOD_TYPE_LABELS } from "@/lib/types";
import FeedingForm from "./FeedingForm";

interface Props {
  feedings: Feeding[];
  onChanged: () => void;
  onFeedingSaved?: () => void;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  });
}

function foodEmoji(type: string) {
  if (type === "dry") return "🥣";
  if (type === "treat") return "🐟";
  return "🍗";
}

function IconBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const [pr, setPr] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPr(true)}
      onMouseUp={() => setPr(false)}
      onTouchStart={() => setPr(true)}
      onTouchEnd={() => setPr(false)}
      style={{
        background: "var(--bg)",
        border: "none",
        borderRadius: 10,
        width: 34,
        height: 34,
        cursor: "pointer",
        fontSize: 15,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: pr ? "scale(0.86)" : "scale(1)",
        transition: "transform 0.12s",
      }}
    >
      {children}
    </button>
  );
}

export default function FeedingList({ feedings, onChanged, onFeedingSaved }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Удалить запись?")) return;
    await fetch(`/api/feedings/${id}`, { method: "DELETE" });
    onChanged();
  }

  if (feedings.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "var(--text3)", fontSize: 13, fontWeight: 600, padding: "24px 0" }}>
        Пока не было кормлений
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {feedings.map((f, i) => (
        <div
          key={f.id}
          style={{
            background: "var(--surface)",
            borderRadius: 16,
            padding: "13px 16px",
            boxShadow: "0 2px 10px var(--sh)",
            animation: `fadeUp 0.4s cubic-bezier(0.34, 1.2, 0.64, 1) ${0.3 + i * 0.07}s both`,
          }}
        >
          {editingId === f.id ? (
            <FeedingForm
              feeding={f}
              onSaved={() => { setEditingId(null); onChanged(); onFeedingSaved?.(); }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: 22, marginRight: 13 }}>{foodEmoji(f.food_type)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 14.5 }}>
                  {FOOD_TYPE_LABELS[f.food_type]} · {f.amount_grams} г
                </div>
                <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>
                  {formatTime(f.fed_at)}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <IconBtn onClick={() => setEditingId(f.id)}>✏️</IconBtn>
                <IconBtn onClick={() => handleDelete(f.id)}>🗑️</IconBtn>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
