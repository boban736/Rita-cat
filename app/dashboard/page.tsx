"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Feeding, Settings, StockInfo } from "@/lib/types";
import { registerPush } from "@/lib/push";
import FeedingForm from "@/components/FeedingForm";
import FeedingList from "@/components/FeedingList";
import DryProgress from "@/components/DryProgress";
import SettingsModal from "@/components/SettingsModal";
import BulkFeedingModal from "@/components/BulkFeedingModal";
import StockWidget from "@/components/StockWidget";
import PurchaseModal from "@/components/PurchaseModal";
import WaterWidget from "@/components/WaterWidget";
import PurchaseHistory from "@/components/PurchaseHistory";
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
  const [stock, setStock] = useState<StockInfo | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const [pushState, setPushState] = useState<"idle" | "subscribed" | "denied" | "loading">("idle");
  const [pushWarning, setPushWarning] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const params = new URLSearchParams({
      start: start.toISOString(),
      end: end.toISOString(),
    });

    const [feedingsRes, settingsRes, stockRes] = await Promise.all([
      fetch(`/api/feedings?${params}`),
      fetch("/api/settings"),
      fetch("/api/stock"),
    ]);

    if (feedingsRes.status === 401) {
      router.push("/login");
      return;
    }

    const [feedingsData, settingsData, stockData] = await Promise.all([
      feedingsRes.json(),
      settingsRes.json(),
      stockRes.json(),
    ]);

    setFeedings(feedingsData);
    setSettings(settingsData);
    setStock(stockData);
    setLoading(false);
  }, [date, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Регистрируем service worker при загрузке
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    // Проверить текущий статус подписки
    if ("Notification" in window && Notification.permission === "granted") {
      setPushState("subscribed");
    }
  }, []);

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  async function handlePushToggle() {
    if (pushState === "subscribed") return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as { standalone?: boolean }).standalone === true;

    if (!isStandalone) {
      setPushWarning(true);
      return;
    }

    setPushWarning(false);
    setPushState("loading");
    const result = await registerPush();
    setPushState(result === "subscribed" ? "subscribed" : result === "denied" ? "denied" : "idle");
  }

  const dryEaten = feedings
    .filter((f) => f.food_type === "dry")
    .reduce((sum, f) => sum + f.amount_grams, 0);

  const isToday = toDateStr(date) === toDateStr(new Date());

  const pushIcon =
    pushState === "subscribed" ? "🔔" : pushState === "denied" ? "🔕" : pushState === "loading" ? "⏳" : "🔔";
  const pushTitle =
    pushState === "subscribed"
      ? "Уведомления включены"
      : pushState === "denied"
      ? "Уведомления отклонены"
      : "Включить уведомления";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐱</span>
            <span className="font-semibold text-gray-800">Ритка</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={handlePushToggle}
              disabled={pushState === "subscribed" || pushState === "loading" || pushState === "denied"}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              title={pushTitle}
            >
              {pushIcon}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              title="Настройки"
            >
              ⚙️
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors text-sm"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      {pushWarning && (
        <div className="max-w-lg mx-auto px-4 pt-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start justify-between gap-3">
            <p className="text-xs text-amber-700">
              Откройте приложение с рабочего стола (не через Safari) и нажмите 🔔 снова.
            </p>
            <button
              onClick={() => setPushWarning(false)}
              className="text-amber-400 hover:text-amber-600 shrink-0 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
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

        {/* Запас корма */}
        {stock && (
          <StockWidget stock={stock} onPurchase={() => setShowPurchase(true)} />
        )}

        {/* История закупок */}
        <PurchaseHistory />

        {/* Вода */}
        {settings && (
          <WaterWidget
            settings={settings}
            onChanged={(s) => setSettings(s)}
          />
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
                    showToast("Сохранено ✓");
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
            <p className="text-center text-gray-400 text-sm py-8">Загружаем...</p>
          ) : (
            <FeedingList
              feedings={feedings}
              onChanged={loadData}
              onFeedingSaved={() => showToast("Сохранено ✓")}
            />
          )}
        </div>
      </main>

      {showBulk && (
        <BulkFeedingModal onSaved={loadData} onClose={() => setShowBulk(false)} />
      )}
      {showPurchase && (
        <PurchaseModal onSaved={loadData} onClose={() => setShowPurchase(false)} />
      )}
      {showSettings && settings && (
        <SettingsModal
          settings={settings}
          onSaved={(s) => setSettings(s)}
          onClose={() => setShowSettings(false)}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm font-medium px-5 py-2.5 rounded-2xl shadow-lg pointer-events-none z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
