import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendPushToAll } from "@/lib/webpush";

function checkCronSecret(request: Request) {
  return request.headers.get("x-cron-secret") === process.env.CRON_SECRET;
}

export async function GET(request: Request) {
  if (!checkCronSecret(request))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [purchasesRes, feedingsRes, settingsRes] = await Promise.all([
    supabase.from("purchases").select("amount_grams"),
    supabase.from("feedings").select("amount_grams").eq("food_type", "dry"),
    supabase.from("settings").select("dry_limit_grams").eq("id", 1).single(),
  ]);

  if (purchasesRes.error || feedingsRes.error || settingsRes.error)
    return NextResponse.json({ error: "DB error" }, { status: 500 });

  const total_purchased = purchasesRes.data.reduce((s, r) => s + r.amount_grams, 0);
  const total_consumed = feedingsRes.data.reduce((s, r) => s + r.amount_grams, 0);
  const remaining = Math.max(total_purchased - total_consumed, 0);
  const limit = settingsRes.data.dry_limit_grams;
  const days_left = limit > 0 ? Math.floor(remaining / limit) : 0;

  if (days_left < 5) {
    await sendPushToAll(
      "📦 Корм заканчивается",
      `Осталось ~${days_left} дн (${remaining}г). Пора закупиться!`
    );
    return NextResponse.json({ sent: true, days_left, remaining });
  }

  return NextResponse.json({ sent: false, days_left, remaining });
}
