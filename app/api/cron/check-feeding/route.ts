import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendPushToAll } from "@/lib/webpush";

// Пороги в граммах по часу МСК (UTC+3)
const THRESHOLDS: Record<number, { min: number; label: string }> = {
  11: { min: 20, label: "к 11:00" },
  16: { min: 40, label: "к 16:00" },
  21: { min: 60, label: "к 21:00" },
};

function checkCronSecret(request: Request) {
  return request.headers.get("x-cron-secret") === process.env.CRON_SECRET;
}

export async function GET(request: Request) {
  if (!checkCronSecret(request))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const nowMoscow = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const hour = nowMoscow.getUTCHours();
  const threshold = THRESHOLDS[hour];

  if (!threshold)
    return NextResponse.json({ skipped: true, hour });

  // Начало и конец сегодняшнего дня по МСК
  const todayMoscow = nowMoscow.toISOString().slice(0, 10);
  const start = new Date(`${todayMoscow}T00:00:00+03:00`).toISOString();
  const end = new Date(`${todayMoscow}T23:59:59+03:00`).toISOString();

  const { data, error } = await supabase
    .from("feedings")
    .select("amount_grams")
    .eq("food_type", "dry")
    .gte("fed_at", start)
    .lte("fed_at", end);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const total = data.reduce((s, r) => s + r.amount_grams, 0);

  if (total < threshold.min) {
    await sendPushToAll(
      "🐱 Ритка не покормлена",
      `Дано ${total}г из ${threshold.min}г ${threshold.label}`
    );
    return NextResponse.json({ sent: true, total, threshold: threshold.min });
  }

  return NextResponse.json({ sent: false, total, threshold: threshold.min });
}
