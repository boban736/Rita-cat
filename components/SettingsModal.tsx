"use client";

import { useState } from "react";
import type { Settings } from "@/lib/types";

interface Props {
  settings: Settings;
  onSaved: (s: Settings) => void;
  onClose: () => void;
}

export default function SettingsModal({ settings, onSaved, onClose }: Props) {
  const [limit, setLimit] = useState(settings.dry_limit_grams.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dry_limit_grams: Number(limit) }),
    });

    if (res.ok) {
      const data = await res.json();
      onSaved(data);
      onClose();
    } else {
      const data = await res.json();
      setError(data.error ?? "Ошибка");
    }

    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Настройки</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Лимит сухого корма в день (г)
            </label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              min="1"
              max="500"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              required
              autoFocus
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-400 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl py-3 text-sm font-medium transition-colors"
            >
              {loading ? "Сохраняем..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
