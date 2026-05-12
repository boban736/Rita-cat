"use client";

import type { Procedure } from "@/lib/types";

interface Props {
  procedures: Procedure[];
  onDeleted: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Moscow",
  });
}

export default function ProcedureList({ procedures, onDeleted }: Props) {
  async function handleDelete(id: string) {
    const res = await fetch(`/api/procedures/${id}`, { method: "DELETE" });
    if (res.ok) onDeleted();
  }

  if (procedures.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "var(--text3)", fontSize: 13, padding: "32px 0" }}>
        Записей нет
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {procedures.map((p) => (
        <div
          key={p.id}
          style={{
            background: "var(--surface2)",
            borderRadius: 14,
            padding: "12px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 2 }}>
              {p.title}
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)" }}>
              {formatDate(p.performed_at)}
            </div>
            {p.description && (
              <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 4 }}>
                {p.description}
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
            {p.cost > 0 && (
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>
                {p.cost} MDL
              </span>
            )}
            <button
              onClick={() => handleDelete(p.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 16,
                opacity: 0.4,
                padding: 2,
                lineHeight: 1,
              }}
              title="Удалить"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
