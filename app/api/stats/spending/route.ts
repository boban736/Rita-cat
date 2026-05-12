import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { SESSION_COOKIE } from "@/lib/auth";

async function isAuthorized() {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value === process.env.APP_PASSWORD;
}

export async function GET() {
  if (!(await isAuthorized()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [purchasesRes, proceduresRes] = await Promise.all([
    supabase.from("purchases").select("purchased_at, price"),
    supabase.from("procedures").select("performed_at, cost"),
  ]);

  if (purchasesRes.error || proceduresRes.error)
    return NextResponse.json({ error: "DB error" }, { status: 500 });

  const map = new Map<string, { food: number; procedures: number }>();

  for (const p of purchasesRes.data) {
    const month = p.purchased_at.slice(0, 7);
    const entry = map.get(month) ?? { food: 0, procedures: 0 };
    map.set(month, { ...entry, food: entry.food + (p.price ?? 0) });
  }

  for (const p of proceduresRes.data) {
    const month = p.performed_at.slice(0, 7);
    const entry = map.get(month) ?? { food: 0, procedures: 0 };
    map.set(month, { ...entry, procedures: entry.procedures + (p.cost ?? 0) });
  }

  const result = Array.from(map.entries())
    .map(([month, v]) => ({
      month,
      food: v.food,
      procedures: v.procedures,
      total: v.food + v.procedures,
    }))
    .sort((a, b) => b.month.localeCompare(a.month));

  return NextResponse.json(result);
}
