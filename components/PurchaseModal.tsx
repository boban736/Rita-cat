"use client";

import { useState } from "react";

interface Props {
  onSaved: () => void;
  onClose: () => void;
}

export default function PurchaseModal({ onSaved, onClose }: Props) {
  const [grams, setGrams] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount_grams: Number(grams) }),
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
          <span className="text-2xl">📦</span>
          <h2 className="text-lg font-semibold text-[var(--text)]">Закупка корма</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text2)] mb-1">
              Купил (г)
            </label>
            <input
              type="number"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              min="1"
              placeholder="500"
              className="w-full bg-[var(--field)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text3)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
              required
              autoFocus
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
              disabled={loading || !grams}
              className="flex-1 bg-[var(--green)] hover:brightness-110 disabled:opacity-50 text-[var(--accent-contrast)] rounded-xl py-3 text-sm font-medium transition"
            >
              {loading ? "Сохраняем..." : "Записать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
