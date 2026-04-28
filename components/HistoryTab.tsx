"use client";

import { useState, useEffect } from "react";
import type { Feeding } from "@/lib/types";
import { FOOD_TYPE_LABELS } from "@/lib/types";
import { format, subDays } from "date-fns";
import { ru } from "date-fns/locale";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  });
}

function dayLabel(d: Date) {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const dStr = format(d, "yyyy-MM-dd");
  if (dStr === todayStr) return "Сегодня";
  if (dStr === format(subDays(new Date(), 1), "yyyy-MM-dd")) return "Вчера";
  return format(d, "EEE, d MMM", { locale: ru });
}

interface DayData {
  date: Date;
  feedings: Feeding[];
}

export default function HistoryTab() {
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();

    Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const d = subDays(today, i);
        const start = new Date(d);
        start.setHours(0, 0, 0, 0);
        const end = new Date(d);
        end.setHours(23, 59, 59, 999);
        const params = new URLSearchParams({ start: start.toISOString(), end: end.toISOString() });
        return fetch(`/api/feedings?${params}`)
          .then((r) => r.json())
          .then((feedings: Feeding[]) => ({ date: d, feedings }));
      })
    ).then((results) => {
      setDays(results);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{
      padding: "20px 14px calc(90px + env(safe-area-inset-bottom, 0px))",
    }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.3, textTransform: "uppercase", color: "var(--text3)", marginBottom: 14 }}>
        История кормлений
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "var(--text3)", fontSize: 13, padding: "40px 0" }}>
          Загружаем...
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {days.map((day, i) => (
            <div key={i} style={{
              background: "var(--surface)",
              borderRadius: 18,
              padding: "16px 18px",
              boxShadow: "0 2px 14px var(--sh)",
              animation: `fadeUp 0.4s cubic-bezier(0.34, 1.2, 0.64, 1) ${i * 0.06}s both`,
            }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10, color: "var(--text2)" }}>
                {dayLabel(day.date)}
              </div>
              {day.feedings.length === 0 ? (
                <div style={{ fontSize: 13, color: "var(--text3)", fontWeight: 600 }}>Не кормили</div>
              ) : (
                day.feedings.map((f, j) => (
                  <div key={f.id} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 0",
                    borderTop: j > 0 ? "1px solid var(--border)" : undefined,
                  }}>
                    <span style={{ fontSize: 18 }}>🥣</span>
                    <div style={{ flex: 1, fontSize: 13.5, fontWeight: 700 }}>
                      {FOOD_TYPE_LABELS[f.food_type]} · {f.amount_grams} г
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text3)", fontWeight: 600 }}>
                      {formatTime(f.fed_at)}
                    </div>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
