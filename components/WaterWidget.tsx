"use client";

import type { Settings } from "@/lib/types";

interface Props {
  settings: Settings;
  onChanged: (s: Settings) => void;
}

function daysAgo(isoString: string | null): number | null {
  if (!isoString) return null;
  return Math.floor((Date.now() - new Date(isoString).getTime()) / 86400000);
}

export default function WaterWidget({ settings, onChanged }: Props) {
  const days = daysAgo(settings.water_changed_at);

  const color =
    days === null || days > 3
      ? "text-red-500"
      : days > 2
      ? "text-orange-500"
      : "text-blue-500";

  const label =
    days === null
      ? "Не записано"
      : days === 0
      ? "Сегодня"
      : days === 1
      ? "Вчера"
      : `${days} дн. назад`;

  async function handleChange() {
    const res = await fetch("/api/water", { method: "PUT" });
    if (res.ok) {
      const data = await res.json();
      onChanged(data);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
          Вода
        </p>
        <p className={`text-base font-semibold mt-0.5 ${color}`}>
          💧 {label}
        </p>
      </div>
      <button
        onClick={handleChange}
        className="text-sm border border-gray-200 text-gray-600 px-3 py-2 rounded-xl hover:border-blue-300 hover:text-blue-500 transition-colors"
      >
        Сменила
      </button>
    </div>
  );
}
