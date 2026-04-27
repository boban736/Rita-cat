import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkBearer } from "@/lib/auth";

const THRESHOLDS: Record<number, number> = { 11: 20, 16: 40, 21: 60 };

export async function GET(request: Request) {
  if (!checkBearer(request.headers.get("Authorization")))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const nowMoscow = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const hour = nowMoscow.getUTCHours();
  const todayMoscow = nowMoscow.toISOString().slice(0, 10);
  const start = new Date(`${todayMoscow}T00:00:00+03:00`).toISOString();
  const end = new Date(`${todayMoscow}T23:59:59+03:00`).toISOString();

  const [feedingsRes, settingsRes, purchasesRes, allDryRes] = await Promise.all([
    supabase.from("feedings").select("amount_grams").eq("food_type", "dry").gte("fed_at", start).lte("fed_at", end),
    supabase.from("settings").select("*").eq("id", 1).single(),
    supabase.from("purchases").select("amount_grams"),
    supabase.from("feedings").select("amount_grams").eq("food_type", "dry"),
  ]);

  const fed_today = feedingsRes.data?.reduce((s, r) => s + r.amount_grams, 0) ?? 0;
  const settings = settingsRes.data;
  const threshold = THRESHOLDS[hour] ?? null;

  const total_purchased = purchasesRes.data?.reduce((s, r) => s + r.amount_grams, 0) ?? 0;
  const total_consumed = allDryRes.data?.reduce((s, r) => s + r.amount_grams, 0) ?? 0;
  const remaining = Math.max(total_purchased - total_consumed, 0);
  const stock_days_left = settings?.dry_limit_grams > 0 ? Math.floor(remaining / settings.dry_limit_grams) : 0;

  const water_changed_at = settings?.water_changed_at ? new Date(settings.water_changed_at) : null;
  const water_days_ago = water_changed_at
    ? Math.floor((Date.now() - water_changed_at.getTime()) / 86400000)
    : null;

  const messages: string[] = [];

  if (threshold !== null && fed_today < threshold) {
    messages.push(`🐱 Ритка не покормлена (${fed_today}г из ${threshold}г к ${hour}:00)`);
  }
  if (water_days_ago !== null && water_days_ago > 2) {
    messages.push(`💧 Вода не менялась ${water_days_ago} дн.`);
  }
  if (stock_days_left < 5) {
    messages.push(`📦 Корм заканчивается (~${stock_days_left} дн.)`);
  }

  return NextResponse.json({
    should_notify: messages.length > 0,
    message: messages.join("\n"),
    details: { fed_today, feeding_threshold: threshold, water_days_ago, stock_days_left },
  });
}
