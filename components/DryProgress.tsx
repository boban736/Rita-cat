interface Props {
  eaten: number;
  limit: number;
}

export default function DryProgress({ eaten, limit }: Props) {
  const pct = Math.min((eaten / limit) * 100, 100);
  const remaining = Math.max(limit - eaten, 0);
  const over = eaten > limit;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            Сухой корм сегодня
          </p>
          <p className="text-2xl font-bold text-gray-800 mt-0.5">
            {eaten} г
            <span className="text-sm font-normal text-gray-400 ml-1">
              / {limit} г
            </span>
          </p>
        </div>
        <div className="text-right">
          {over ? (
            <p className="text-red-500 font-semibold text-sm">
              +{eaten - limit} г превышение
            </p>
          ) : (
            <>
              <p className="text-xs text-gray-400">Осталось</p>
              <p className="text-lg font-bold text-green-600">{remaining} г</p>
            </>
          )}
        </div>
      </div>

      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            over ? "bg-red-400" : pct > 80 ? "bg-orange-400" : "bg-green-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
