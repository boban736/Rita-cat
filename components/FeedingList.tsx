"use client";

import { useState } from "react";
import type { Feeding } from "@/lib/types";
import { FOOD_TYPE_LABELS } from "@/lib/types";
import FeedingForm from "./FeedingForm";

interface Props {
  feedings: Feeding[];
  onChanged: () => void;
}

function formatTime(isoString: string) {
  return new Date(isoString).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  });
}

export default function FeedingList({ feedings, onChanged }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Удалить запись?")) return;

    await fetch(`/api/feedings/${id}`, { method: "DELETE" });
    onChanged();
  }

  if (feedings.length === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-8">
        Пока не было кормлений
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {feedings.map((feeding) => (
        <li
          key={feeding.id}
          className="bg-white rounded-2xl border border-gray-100 p-4"
        >
          {editingId === feeding.id ? (
            <FeedingForm
              feeding={feeding}
              onSaved={() => {
                setEditingId(null);
                onChanged();
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl">
                  {feeding.food_type === "dry"
                    ? "🥣"
                    : feeding.food_type === "treat"
                    ? "🐟"
                    : "🍗"}
                </span>
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {FOOD_TYPE_LABELS[feeding.food_type]} · {feeding.amount_grams} г
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatTime(feeding.fed_at)}
                  </div>
                </div>
              </div>

              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => setEditingId(feeding.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Редактировать"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(feeding.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Удалить"
                >
                  🗑️
                </button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
