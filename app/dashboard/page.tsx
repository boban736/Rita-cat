"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Feeding, Settings, StockInfo } from "@/lib/types";
import FeedingList from "@/components/FeedingList";
import DryProgress from "@/components/DryProgress";
import BulkFeedingModal from "@/components/BulkFeedingModal";
import StockWidget from "@/components/StockWidget";
import PurchaseModal from "@/components/PurchaseModal";
import WaterWidget from "@/components/WaterWidget";
import PurchaseHistory from "@/components/PurchaseHistory";
import HistoryTab from "@/components/HistoryTab";
import SettingsTab from "@/components/SettingsTab";
import { format, addDays, subDays } from "date-fns";
import { ru } from "date-fns/locale";

type Tab = "today" | "history" | "settings";

function toDateStr(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function formatDayLabel(d: Date) {
  const today = new Date();
  if (toDateStr(d) === toDateStr(today)) return "Сегодня";
  if (toDateStr(d) === toDateStr(subDays(today, 1))) return "Вчера";
  return format(d, "d MMMM", { locale: ru });
}

function Burst({ x, y }: { x: number; y: number }) {
  const icons = ["🐾", "✨", "🐟", "💛", "⭐"];
  return (
    <div style={{ position: "fixed", left: x, top: y, pointerEvents: "none", zIndex: 9999 }}>
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} style={{
          position: "absolute",
          fontSize: 15,
          animation: `floatUp 0.85s ease-out ${i * 0.04}s forwards`,
          left: Math.sin((i / 9) * Math.PI * 2) * (28 + Math.random() * 24),
          top: Math.cos((i / 9) * Math.PI * 2) * (18 + Math.random() * 18),
        }}>
          {icons[i % icons.length]}
        </div>
      ))}
    </div>
  );
}

function NavArrow({ children, onClick, dim }: {
  children: React.ReactNode;
  onClick: () => void;
  dim?: boolean;
}) {
  const [pr, setPr] = useState(false);
  return (
    <button
      onClick={dim ? undefined : onClick}
      onMouseDown={() => { if (!dim) setPr(true); }}
      onMouseUp={() => setPr(false)}
      onTouchStart={() => { if (!dim) setPr(true); }}
      onTouchEnd={() => setPr(false)}
      style={{
        background: "var(--surface2)",
        border: "1px solid var(--border)",
        borderRadius: 13,
        width: 42,
        height: 42,
        fontSize: 18,
        cursor: dim ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: dim ? 0.35 : 1,
        transform: pr ? "scale(0.86)" : "scale(1)",
        transition: "transform 0.12s",
      }}
    >
      {children}
    </button>
  );
}

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg2)", borderRadius: 14, padding: "7px 12px" }}>
      <button
        onClick={() => onChange(Math.max(5, value - 5))}
        style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 900, fontSize: 22, color: "var(--green)", lineHeight: 1, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}
      >−</button>
      <span style={{ fontWeight: 900, fontSize: 17, minWidth: 38, textAlign: "center" }}>{value}г</span>
      <button
        onClick={() => onChange(value + 5)}
        style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 900, fontSize: 22, color: "var(--green)", lineHeight: 1, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}
      >+</button>
    </div>
  );
}

const TABS = [
  { id: "today" as Tab, icon: "🐾", label: "Сегодня" },
  { id: "history" as Tab, icon: "📋", label: "История" },
  { id: "settings" as Tab, icon: "⚙️", label: "Настройки" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("today");
  const [date, setDate] = useState(new Date());
  const [feedings, setFeedings] = useState<Feeding[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [stock, setStock] = useState<StockInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBulk, setShowBulk] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [burst, setBurst] = useState<{ x: number; y: number } | null>(null);
  const [justFed, setJustFed] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);
  const [feedAmt, setFeedAmt] = useState(20);
  const [slideDir, setSlideDir] = useState<-1 | 1 | null>(null);
  const [slideKey, setSlideKey] = useState(0);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  function triggerBurst(e: React.MouseEvent) {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setBurst({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    setTimeout(() => setBurst(null), 1100);
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const params = new URLSearchParams({ start: start.toISOString(), end: end.toISOString() });

    const [feedingsRes, settingsRes, stockRes] = await Promise.all([
      fetch(`/api/feedings?${params}`),
      fetch("/api/settings"),
      fetch("/api/stock"),
    ]);

    if (feedingsRes.status === 401) { router.push("/login"); return; }

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

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  async function doFeed(amt: number, e: React.MouseEvent) {
    triggerBurst(e);
    const now = new Date();
    const res = await fetch("/api/feedings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount_grams: amt, food_type: "dry", fed_at: now.toISOString() }),
    });
    if (res.ok) {
      setJustFed(true);
      setTimeout(() => setJustFed(false), 1600);
      loadData();
      showToast("Насыпано ✓");
    }
  }

  async function handleFeed(e: React.MouseEvent) {
    setFeedOpen(false);
    await doFeed(feedAmt, e);
  }

  async function handleQuickFeed(amt: number, e: React.MouseEvent) {
    await doFeed(amt, e);
  }

  function navDay(d: -1 | 1) {
    setSlideDir(d);
    setSlideKey((k) => k + 1);
    setDate((prev) => d === -1 ? subDays(prev, 1) : addDays(prev, 1));
    setTimeout(() => setSlideDir(null), 350);
  }

  const dryEaten = feedings.filter((f) => f.food_type === "dry").reduce((s, f) => s + f.amount_grams, 0);
  const isToday = toDateStr(date) === toDateStr(new Date());

  const slideAnim = slideDir === -1
    ? "slRight 0.32s cubic-bezier(0.34, 1.2, 0.64, 1) both"
    : slideDir === 1
    ? "slLeft 0.32s cubic-bezier(0.34, 1.2, 0.64, 1) both"
    : undefined;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100svh", background: "var(--bg)", position: "relative" }}>
      {burst && <Burst x={burst.x} y={burst.y} />}

      {/* ── Header ── */}
      <header style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "14px 18px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 1px 10px var(--sh)",
        position: "sticky",
        top: 0,
        zIndex: 40,
        animation: "fadeIn 0.3s ease both",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 26 }}>🐱</span>
          <span style={{ fontSize: 19, fontWeight: 900 }}>Ритка</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>🔔</button>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "1.5px solid var(--border)",
              borderRadius: 10,
              padding: "5px 12px",
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: 12.5,
              color: "var(--text2)",
              cursor: "pointer",
            }}
          >Выйти</button>
        </div>
      </header>

      {/* ── Today tab ── */}
      {tab === "today" && (
        <>
          {/* Day navigator */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 18px 14px",
            animation: "fadeIn 0.35s ease both",
          }}>
            <NavArrow onClick={() => navDay(-1)}>←</NavArrow>
            <h2 key={slideKey} style={{ fontSize: 20, fontWeight: 900, animation: slideAnim }}>
              {formatDayLabel(date)}
            </h2>
            <NavArrow onClick={() => navDay(1)} dim={isToday}>→</NavArrow>
          </div>

          <div key={slideKey} style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: "0 14px calc(90px + env(safe-area-inset-bottom, 0px))",
            animation: slideAnim ?? "fadeIn 0.3s ease both",
          }}>
            {/* Food progress */}
            {settings && (
              <DryProgress eaten={dryEaten} limit={settings.dry_limit_grams} justFed={justFed} onQuickFeed={handleQuickFeed} />
            )}

            {/* Stock */}
            {stock && (
              <StockWidget
                stock={stock}
                onPurchase={(e) => { triggerBurst(e); setShowPurchase(true); }}
              />
            )}

            {/* Purchase history accordion */}
            <PurchaseHistory />

            {/* Water */}
            {settings && (
              <WaterWidget settings={settings} onChanged={(s) => setSettings(s)} />
            )}

            {/* Другое количество card */}
            {isToday && (
              <div style={{
                background: "var(--surface)",
                borderRadius: 18,
                padding: "16px 18px",
                boxShadow: "0 2px 14px var(--sh)",
                animation: "fadeUp 0.45s cubic-bezier(0.34, 1.2, 0.64, 1) 0.25s both",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 800, fontSize: 15.5 }}>Другое количество</span>
                  <button
                    onClick={() => setFeedOpen((v) => !v)}
                    style={{
                      background: feedOpen ? "var(--green-bg)" : "var(--bg2)",
                      border: "none",
                      borderRadius: 12,
                      width: 38,
                      height: 38,
                      cursor: "pointer",
                      color: "var(--green)",
                      fontSize: 22,
                      fontWeight: 300,
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transform: feedOpen ? "rotate(45deg)" : "rotate(0)",
                      transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s",
                    }}
                  >+</button>
                </div>

                <div style={{
                  overflow: "hidden",
                  maxHeight: feedOpen ? 130 : 0,
                  transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                }}>
                  <div style={{ paddingTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text2)" }}>Количество:</span>
                      <Stepper value={feedAmt} onChange={setFeedAmt} />
                    </div>
                    <button
                      onClick={handleFeed}
                      style={{
                        width: "100%",
                        background: "var(--green)",
                        color: "var(--accent-contrast)",
                        border: "none",
                        borderRadius: 14,
                        padding: "11px 0",
                        fontFamily: "inherit",
                        fontWeight: 800,
                        fontSize: 14.5,
                        cursor: "pointer",
                        boxShadow: "0 4px 16px oklch(0.52 0.18 145 / 0.4)",
                        transition: "transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      }}
                      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
                      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      onTouchStart={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
                      onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    >
                      🐾 Насыпать {feedAmt}г
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: feedOpen ? 12 : 8 }}>
                  <div
                    onClick={() => setShowBulk(true)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 12px",
                      background: "var(--bg2)",
                      borderRadius: 12,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text2)",
                      cursor: "pointer",
                    }}
                  >
                    <span>Уезжаем — насыпать заранее</span>
                    <span>💼</span>
                  </div>
                </div>
              </div>
            )}

            {/* Feedings list */}
            <div style={{ animation: "fadeUp 0.5s 0.3s both" }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
                paddingLeft: 2,
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.3, textTransform: "uppercase", color: "var(--text3)" }}>
                  Кормления · {feedings.length}
                </div>
              </div>
              {loading ? (
                <div style={{ textAlign: "center", color: "var(--text3)", fontSize: 13, padding: "24px 0" }}>
                  Загружаем...
                </div>
              ) : (
                <FeedingList feedings={feedings} onChanged={loadData} onFeedingSaved={() => showToast("Сохранено ✓")} />
              )}
            </div>
          </div>
        </>
      )}

      {tab === "history" && <HistoryTab />}
      {tab === "settings" && settings && <SettingsTab settings={settings} onSaved={(s) => setSettings(s)} />}

      {/* ── Bottom tab bar ── */}
      <nav style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 480,
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        padding: "10px 0 calc(10px + env(safe-area-inset-bottom, 0px))",
        display: "flex",
        justifyContent: "space-around",
        zIndex: 50,
        boxShadow: "0 -4px 20px var(--sh)",
      }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 10,
              fontWeight: 700,
              color: tab === t.id ? "var(--green)" : "var(--text3)",
              padding: "4px 14px",
              borderRadius: 12,
              minWidth: 60,
              transition: "color 0.2s",
            }}
          >
            <span style={{ fontSize: 22, lineHeight: 1 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {/* ── Modals ── */}
      {showBulk && (
        <BulkFeedingModal onSaved={loadData} onClose={() => setShowBulk(false)} />
      )}
      {showPurchase && (
        <PurchaseModal
          onSaved={() => {
            loadData();
            setBurst({ x: window.innerWidth / 2, y: window.innerHeight / 3 });
            setTimeout(() => setBurst(null), 1100);
            showToast("Закупка записана ✓");
          }}
          onClose={() => setShowPurchase(false)}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: "calc(90px + env(safe-area-inset-bottom, 0px))",
          left: "50%",
          transform: "translateX(-50%)",
          background: "oklch(0.18 0.02 30)",
          color: "var(--text)",
          fontSize: 13,
          fontWeight: 700,
          padding: "10px 20px",
          borderRadius: 99,
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          pointerEvents: "none",
          zIndex: 100,
          animation: "fadeIn 0.2s ease both",
          whiteSpace: "nowrap",
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
