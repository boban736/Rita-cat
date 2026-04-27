"use client";

import { useState } from "react";
import type { Feeding, FoodType } from "@/lib/types";
import { FOOD_TYPE_LABELS } from "@/lib/types";

interface Props {
  feeding?: Feeding;
  onSaved: () => void;
  onCancel?: () => void;
}

export default function FeedingForm({ feeding, onSaved, onCancel }: Props) {
  const [amount, setAmount] = useState(feeding?.amount_grams.toString() ?? "");
  const [foodType, setFoodType] = useState<FoodType>(feeding?.food_type ?? "dry");
  const [fedAt, setFedAt] = useState(() => {
    const d = feeding?.fed_at ? new Date(feeding.fed_at) : new Date();
    // datetime-local input needs local time string
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!feeding;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = isEdit ? `/api/feedings/${feeding.id}` : "/api/feedings";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount_grams: Number(amount),
        food_type: foodType,
        fed_at: new Date(fedAt).toISOString(),
      }),
    });

    if (res.ok) {
      onSaved();
    } else {
      const data = await res.json();
      setError(data.error ?? "Ошибка");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Тип еды
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["dry", "treat", "home"] as FoodType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFoodType(type)}
              className={`py-2 px-3 rounded-xl text-sm font-medium border transition-colors ${
                foodType === type
                  ? "bg-orange-400 border-orange-400 text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:border-orange-300"
              }`}
            >
              {FOOD_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Количество (г)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="1"
          max="500"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          placeholder="30"
          required
          autoFocus={!isEdit}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Время
        </label>
        <input
          type="datetime-local"
          value={fedAt}
          onChange={(e) => setFedAt(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          required
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !amount}
          className="flex-1 bg-orange-400 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl py-3 text-sm font-medium transition-colors"
        >
          {loading ? "Сохраняем..." : isEdit ? "Сохранить" : "Добавить"}
        </button>
      </div>
    </form>
  );
}
