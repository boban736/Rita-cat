import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE);
  if (session?.value !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const start_date = body.start_date as string;
  const days = Number(body.days);
  const total_grams = Number(body.total_grams);

  if (!start_date || !days || days < 1 || days > 30) {
    return NextResponse.json({ error: "Укажи дату и количество дней (1–30)" }, { status: 400 });
  }
  if (!total_grams || total_grams <= 0) {
    return NextResponse.json({ error: "Укажи количество грамм" }, { status: 400 });
  }

  const per_day = Math.round(total_grams / days);

  const records = Array.from({ length: days }, (_, i) => {
    const d = new Date(start_date);
    d.setDate(d.getDate() + i);
    d.setHours(12, 0, 0, 0);
    return {
      food_type: "dry",
      amount_grams: per_day,
      fed_at: d.toISOString(),
    };
  });

  const { data, error } = await supabase.from("feedings").insert(records).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
