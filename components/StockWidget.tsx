import type { StockInfo } from "@/lib/types";

interface Props {
  stock: StockInfo;
  onPurchase: () => void;
}

export default function StockWidget({ stock, onPurchase }: Props) {
  const { remaining_grams, days_left } = stock;

  const color =
    days_left >= 7
      ? "text-green-600"
      : days_left >= 3
      ? "text-orange-500"
      : "text-red-500";

  const bgColor =
    days_left >= 7
      ? "bg-green-50 border-green-100"
      : days_left >= 3
      ? "bg-orange-50 border-orange-100"
      : "bg-red-50 border-red-100";

  return (
    <div className={`rounded-2xl border p-4 flex items-center justify-between ${bgColor}`}>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
          Запас корма
        </p>
        <p className={`text-xl font-bold mt-0.5 ${color}`}>
          {remaining_grams}г
          <span className="text-sm font-normal text-gray-400 ml-1">
            (~{days_left} дн)
          </span>
        </p>
      </div>
      <button
        onClick={onPurchase}
        className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium px-3 py-2 rounded-xl hover:border-orange-300 hover:text-orange-500 transition-colors"
      >
        <span>📦</span>
        Закупил
      </button>
    </div>
  );
}
