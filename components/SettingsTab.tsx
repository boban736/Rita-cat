"use client";

import { useState } from "react";
import type { Settings } from "@/lib/types";
import { resubscribePush } from "@/lib/push";

interface Props {
  settings: Settings;
  onSaved: (s: Settings) => void;
}

const CAT_ROWS = [
  { label: "Имя", value: "Ритка" },
  { label: "Порода", value: "Беспородная 🐱" },
  { label: "Возраст", value: "3 года" },
];

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "9px 0",
      borderTop: "1px solid var(--border)",
      fontSize: 13.5,
    }}>
      <span style={{ color: "var(--text2)", fontWeight: 600 }}>{label}</span>
      <span style={{ fontWeight: 700, color: "var(--text2)" }}>{value}</span>
    </div>
  );
}

export default function SettingsTab({ settings, onSaved }: Props) {
  const [goal, setGoal] = useState(settings.dry_limit_grams);
  const [saving, setSaving] = useState(false);
  const [testState, setTestState] = useState<"idle" | "loading" | "sent" | "none" | "error">("idle");
  const [resubState, setResubState] = useState<"idle" | "loading" | "done" | "denied" | "error">("idle");

  async function saveGoal(val: number) {
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dry_limit_grams: val }),
    });
    if (res.ok) onSaved(await res.json());
    setSaving(false);
  }

  async function handleTestPush() {
    setTestState("loading");
    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      const data = await res.json();
      setTestState(!res.ok ? "error" : data.sent === 0 ? "none" : "sent");
    } catch {
      setTestState("error");
    }
  }

  async function handleResubscribe() {
    setResubState("loading");
    const result = await resubscribePush();
    setResubState(result === "subscribed" ? "done" : result === "denied" ? "denied" : "error");
  }

  const testLabel: Record<typeof testState, string> = {
    idle: "Тест пуш", loading: "Отправляем...", sent: "Отправлено ✓", none: "Нет подписчиков", error: "Ошибка",
  };
  const resubLabel: Record<typeof resubState, string> = {
    idle: "Переподписаться", loading: "Подписываемся...", done: "Подписано ✓", denied: "Нет разрешения", error: "Ошибка",
  };

  const cardStyle = (delay: number): React.CSSProperties => ({
    background: "var(--surface)",
    borderRadius: 18,
    padding: "16px 18px",
    boxShadow: "0 2px 14px var(--sh)",
    marginBottom: 10,
    animation: `fadeUp 0.4s cubic-bezier(0.34, 1.2, 0.64, 1) ${delay}s both`,
  });

  return (
    <div style={{ padding: "20px 14px calc(90px + env(safe-area-inset-bottom, 0px))" }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.3, textTransform: "uppercase", color: "var(--text3)", marginBottom: 14 }}>
        Настройки
      </div>

      {/* Cat */}
      <div style={cardStyle(0)}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>Кошка</div>
        {CAT_ROWS.map((r) => <Row key={r.label} {...r} />)}
      </div>

      {/* Feeding goal */}
      <div style={cardStyle(0.08)}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>Питание</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text2)", marginBottom: 8 }}>
          Дневная норма: <b style={{ color: "var(--green)" }}>{goal}г</b>
          {saving && <span style={{ fontSize: 11, color: "var(--text3)", marginLeft: 8 }}>Сохраняем...</span>}
        </div>
        <input
          type="range"
          min={20}
          max={120}
          step={5}
          value={goal}
          onChange={(e) => setGoal(Number(e.target.value))}
          onMouseUp={() => saveGoal(goal)}
          onTouchEnd={() => saveGoal(goal)}
          style={{ width: "100%", accentColor: "var(--green)" }}
        />
      </div>

      {/* Push */}
      <div style={cardStyle(0.16)}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>Уведомления</div>
        <p style={{ fontSize: 12, color: "var(--text3)", fontWeight: 600, marginBottom: 12 }}>
          Для работы на iPhone подпишитесь из приложения на рабочем столе, не из Safari.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: testLabel[testState], onClick: handleTestPush, disabled: testState === "loading" },
            { label: resubLabel[resubState], onClick: handleResubscribe, disabled: resubState === "loading" },
          ].map(({ label, onClick, disabled }) => (
            <button
              key={label}
              onClick={onClick}
              disabled={disabled}
              style={{
                flex: 1,
                border: "1.5px solid var(--border)",
                background: "none",
                borderRadius: 14,
                padding: "10px 0",
                fontFamily: "inherit",
                fontWeight: 700,
                fontSize: 13,
                color: "var(--text2)",
                cursor: disabled ? "default" : "pointer",
                opacity: disabled ? 0.5 : 1,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
