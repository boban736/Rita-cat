"use client";

import { useState } from "react";
import type { Settings } from "@/lib/types";
import { resubscribePush } from "@/lib/push";

interface Props {
  settings: Settings;
  onSaved: (s: Settings) => void;
  onClose: () => void;
}

export default function SettingsModal({ settings, onSaved, onClose }: Props) {
  const [limit, setLimit] = useState(settings.dry_limit_grams.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [testState, setTestState] = useState<"idle" | "loading" | "sent" | "none" | "error">("idle");
  const [resubState, setResubState] = useState<"idle" | "loading" | "done" | "error">("idle");

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

  async function handleTestPush() {
    setTestState("loading");
    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      const data = await res.json();
      setTestState(data.sent === 0 ? "none" : "sent");
    } catch {
      setTestState("error");
    }
  }

  async function handleResubscribe() {
    setResubState("loading");
    const result = await resubscribePush();
    setResubState(result === "subscribed" ? "done" : "error");
  }

  const testLabel =
    testState === "loading" ? "Отправляем..." :
    testState === "sent" ? "Отправлено ✓" :
    testState === "none" ? "Нет подписчиков" :
    testState === "error" ? "Ошибка" :
    "Тест пуш";

  const resubLabel =
    resubState === "loading" ? "Подписываемся..." :
    resubState === "done" ? "Подписано ✓" :
    resubState === "error" ? "Ошибка" :
    "Переподписаться";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-5">
        <h2 className="text-lg font-semibold text-gray-800">Настройки</h2>

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

        <div className="border-t border-gray-100 pt-4 space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Уведомления</p>
          <p className="text-xs text-gray-400">
            Для работы на iPhone подпишитесь из приложения на рабочем столе, не из Safari.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleTestPush}
              disabled={testState === "loading"}
              className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {testLabel}
            </button>
            <button
              type="button"
              onClick={handleResubscribe}
              disabled={resubState === "loading"}
              className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {resubLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
