"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      const data = await res.json();
      setError(data.error ?? "Ошибка");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🐱</div>
          <h1 className="text-2xl font-semibold text-[var(--text)]">Ритка</h1>
          <p className="text-[var(--text3)] text-sm mt-1">Трекер кормления</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-[var(--text2)] mb-1">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--field)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text3)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
              placeholder="Введи пароль"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-[var(--danger)] text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-[var(--green)] hover:brightness-110 disabled:opacity-50 text-[var(--accent-contrast)] font-medium rounded-xl py-3 text-sm transition"
          >
            {loading ? "Входим..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}
