"use client";

import { useState } from "react";

interface Props {
  onSaved: () => void;
  onClose: () => void;
}

function toLocalDateStr(d: Date) {
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

export default function BulkFeedingModal({ onSaved, onClose }: Props) {
  const [startDate, setStartDate] = useState(toLocalDateStr(new Date()));
  const [days, setDays] = useState("3");
  const [totalGrams, setTotalGrams] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const perDay =
    Number(totalGrams) > 0 && Number(days) > 0
      ? Math.round(Number(totalGrams) / Number(days))
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/feedings/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start_date: startDate,
        days: Number(days),
        total_grams: Number(totalGrams),
      }),
    });

    if (res.ok) {
      onSaved();
      onClose();
    } else {
      const data = await res.json();
      setError(data.error ?? "Ошибка");
    }

    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-[var(--overlay)] flex items-center justify-center z-50 px-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🧳</span>
          <h2 className="text-lg font-semibold text-[var(--text)]">Уезжаем</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text2)] mb-1">
              Дата начала
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[var(--field)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text2)] mb-1">
              Количество дней
            </label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              min="1"
              max="30"
              className="w-full bg-[var(--field)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text2)] mb-1">
              Всего грамм
            </label>
            <input
              type="number"
              value={totalGrams}
              onChange={(e) => setTotalGrams(e.target.value)}
              min="1"
              placeholder="180"
              className="w-full bg-[var(--field)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text3)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
              required
              autoFocus
            />
          </div>

          {perDay !== null && (
            <div className="bg-[var(--amber-l)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--amber)]">
              {totalGrams}г ÷ {days} дн = ~{perDay}г/день
            </div>
          )}

          {error && <p className="text-[var(--danger)] text-sm">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[var(--border)] text-[var(--text2)] rounded-xl py-3 text-sm font-medium hover:bg-[var(--surface2)] transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading || !totalGrams || !days}
              className="flex-1 bg-[var(--green)] hover:brightness-110 disabled:opacity-50 text-[var(--accent-contrast)] rounded-xl py-3 text-sm font-medium transition"
            >
              {loading ? "Создаём..." : "Записать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
