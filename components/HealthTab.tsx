"use client";

import { useState, useEffect, useCallback } from "react";
import type { Procedure } from "@/lib/types";
import ProcedureList from "@/components/ProcedureList";
import ProcedureForm from "@/components/ProcedureForm";
import SpendingStats from "@/components/SpendingStats";

export default function HealthTab() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/procedures");
    if (res.ok) {
      const data: Procedure[] = await res.json();
      setProcedures(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 12,
      padding: "18px 14px calc(90px + env(safe-area-inset-bottom, 0px))",
      animation: "fadeIn 0.3s ease both",
    }}>
      {/* Procedures section */}
      <div style={{
        background: "var(--surface)",
        borderRadius: 18,
        boxShadow: "0 2px 14px var(--sh)",
        padding: "16px 18px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>💊</span>
            <span style={{ fontWeight: 800, fontSize: 15.5, color: "var(--text)" }}>Здоровье</span>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: "var(--green)",
              border: "none",
              borderRadius: 12,
              width: 36,
              height: 36,
              cursor: "pointer",
              color: "var(--accent-contrast)",
              fontSize: 22,
              fontWeight: 300,
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            +
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "var(--text3)", fontSize: 13, padding: "24px 0" }}>
            Загружаем...
          </div>
        ) : (
          <ProcedureList procedures={procedures} onDeleted={load} />
        )}
      </div>

      {/* Spending stats */}
      <SpendingStats />

      {showForm && (
        <ProcedureForm onSaved={load} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
