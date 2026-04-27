"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Feeding, Settings } from "@/lib/types";
import FeedingForm from "@/components/FeedingForm";
import FeedingList from "@/components/FeedingList";
import DryProgress from "@/components/DryProgress";
import SettingsModal from "@/components/SettingsModal";
import BulkFeedingModal from "@/components/BulkFeedingModal";
import { format, addDays, subDays } from "date-fns";
import { ru } from "date-fns/locale";

function toDateStr(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function formatDayLabel(d: Date) {
  const today = new Date();
  if (toDateStr(d) === toDateStr(today)) return "Сегодня";
  if (toDateStr(d) === toDateStr(subDays(today, 1))) return "Вчера";
  return format(d, "d MMMM", { locale: ru });
}

export default function DashboardPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [feedings, setFeedings] = useState<Feeding[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    // Pass local-day boundaries as ISO strings so the API filters in user's timezone
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const params = new URLSearchParams({
      start: start.toISOString(),
      end: end.toISOString(),
    });
    const [feedingsRes, settingsRes] = await Promise.all([
      fetch(`/api/feedings?${params}`),
      fetch("/api/settings"),
    ]);

    if (feedingsRes.status === 401 || settingsRes.status === 401) {
      router.push("/login");
      return;
    }

    const [feedingsData, settingsData] = await Promise.all([
      feedingsRes.json(),
      settingsRes.json(),
    ]);

    setFeedings(feedingsData);
    setSettings(settingsData);
    setLoading(false);
  }, [date, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  const dryEaten = feedings
    .filter((f) => f.food_type === "dry")
    .reduce((sum, f) => sum + f.amount_grams, 0);

  const isToday = toDateStr(date) === toDateStr(new Date());

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐱</span>
            <span className="font-semibold text-gray-800">Ритка</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              title="Настройки"
            >
              ⚙️
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors text-sm"
              title="Выйти"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Навигация по датам */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setDate((d) => subDays(d, 1))}
            className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 transition-colors text-gray-500"
          >
            ←
          </button>
          <button
            onClick={() => setDate(new Date())}
            className="text-base font-semibold text-gray-800 hover:text-orange-500 transition-colors"
          >
            {formatDayLabel(date)}
          </button>
          <button
            onClick={() => setDate((d) => addDays(d, 1))}
            disabled={isToday}
            className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 transition-colors text-gray-500 disabled:opacity-30"
          >
            →
          </button>
        </div>

        {/* Прогресс сухого корма */}
        {settings && (
          <DryProgress eaten={dryEaten} limit={settings.dry_limit_grams} />
        )}

        {/* Форма добавления */}
        {isToday && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <button
              onClick={() => setShowForm((v) => !v)}
              className="w-full flex items-center justify-between text-left"
            >
              <span className="font-medium text-gray-800">
                {showForm ? "Скрыть форму" : "Покормила"}
              </span>
              <span className="text-orange-400 text-xl">
                {showForm ? "−" : "+"}
              </span>
            </button>

            {showForm && (
              <div className="pt-3 border-t border-gray-100">
                <FeedingForm
                  onSaved={() => {
                    setShowForm(false);
                    loadData();
                  }}
                />
              </div>
            )}

            {!showForm && (
              <button
                onClick={() => setShowBulk(true)}
                className="w-full flex items-center justify-between text-left text-gray-500 hover:text-gray-700 transition-colors"
              >
                <span className="text-sm">Уезжаем — насыпать заранее</span>
                <span>🧳</span>
              </button>
            )}
          </div>
        )}

        {/* Список кормлений */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Кормления
          </h2>
          {loading ? (
            <p className="text-center text-gray-400 text-sm py-8">
              Загружаем...
            </p>
          ) : (
            <FeedingList feedings={feedings} onChanged={loadData} />
          )}
        </div>
      </main>

      {showBulk && (
        <BulkFeedingModal
          onSaved={loadData}
          onClose={() => setShowBulk(false)}
        />
      )}

      {showSettings && settings && (
        <SettingsModal
          settings={settings}
          onSaved={(s) => setSettings(s)}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
