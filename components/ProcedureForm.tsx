"use client";

import { useState } from "react";
import type { ProcedureCategory } from "@/lib/types";

interface Props {
  onSaved: () => void;
  onClose: () => void;
}

const CATEGORIES: { id: ProcedureCategory; label: string; emoji: string }[] = [
  { id: "health", label: "Здоровье", emoji: "💊" },
  { id: "supply", label: "Вещи", emoji: "🧸" },
];

export default function ProcedureForm({ onSaved, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ProcedureCategory>("health");
  const [cost, setCost] = useState("");
  const [description, setDescription] = useState("");
  const [performedAt, setPerformedAt] = useState(() => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/procedures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        category,
        performed_at: new Date(performedAt).toISOString(),
        description: description || null,
        cost: Number(cost) || 0,
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
          <span className="text-2xl">{CATEGORIES.find((c) => c.id === category)?.emoji}</span>
          <h2 className="text-lg font-semibold text-[var(--text)]">Новая запись</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text2)] mb-1">
              Тип
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border transition-colors ${
                    category === c.id
                      ? "bg-[var(--green)] border-[var(--green)] text-[var(--accent-contrast)]"
                      : "bg-[var(--field)] border-[var(--border)] text-[var(--text2)] hover:border-[var(--green)]"
                  }`}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text2)] mb-1">
              Название
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={category === "health" ? "Прививка, глистогонка..." : "Игрушка, шлейка..."}
              className="w-full bg-[var(--field)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text3)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text2)] mb-1">
              Дата
            </label>
            <input
              type="datetime-local"
              value={performedAt}
              onChange={(e) => setPerformedAt(e.target.value)}
              className="w-full bg-[var(--field)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text2)] mb-1">
              Стоимость (MDL)
            </label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              min="0"
              step="0.01"
              placeholder="0"
              className="w-full bg-[var(--field)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text3)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text2)] mb-1">
              Заметки
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder={category === "health" ? "Клиника, врач, препарат..." : "Магазин, бренд..."}
              className="w-full bg-[var(--field)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text3)] focus:outline-none focus:ring-2 focus:ring-[var(--green)] resize-none"
            />
          </div>

          {error && <p className="text-[var(--danger)] text-sm">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[var(--border)] text-[var(--text2)] rounded-xl py-3 text-sm font-medium hover:bg-[var(--surface2)] transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 bg-[var(--green)] hover:brightness-110 disabled:opacity-50 text-[var(--accent-contrast)] rounded-xl py-3 text-sm font-medium transition"
            >
              {loading ? "Сохраняем..." : "Добавить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
