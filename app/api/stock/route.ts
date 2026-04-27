import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { SESSION_COOKIE } from "@/lib/auth";

export async function GET() {
  const jar = await cookies();
  if (jar.get(SESSION_COOKIE)?.value !== process.env.APP_PASSWORD)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [purchasesRes, feedingsRes, settingsRes] = await Promise.all([
    supabase.from("purchases").select("amount_grams"),
    supabase.from("feedings").select("amount_grams").eq("food_type", "dry"),
    supabase.from("settings").select("dry_limit_grams").eq("id", 1).single(),
  ]);

  if (purchasesRes.error || feedingsRes.error || settingsRes.error)
    return NextResponse.json({ error: "DB error" }, { status: 500 });

  const total_purchased = purchasesRes.data.reduce((s, r) => s + r.amount_grams, 0);
  const total_consumed = feedingsRes.data.reduce((s, r) => s + r.amount_grams, 0);
  const remaining_grams = Math.max(total_purchased - total_consumed, 0);
  const dry_limit = settingsRes.data.dry_limit_grams;
  const days_left = dry_limit > 0 ? Math.floor(remaining_grams / dry_limit) : 0;

  return NextResponse.json({ total_purchased, total_consumed, remaining_grams, days_left });
}
