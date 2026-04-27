import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { checkBearer, SESSION_COOKIE } from "@/lib/auth";
import type { FoodType } from "@/lib/types";

async function isAuthorized(request: Request): Promise<boolean> {
  const authHeader = request.headers.get("Authorization");
  if (authHeader) return checkBearer(authHeader);

  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE);
  return session?.value === process.env.APP_PASSWORD;
}

export async function GET(request: Request) {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE);
  if (session?.value !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  let query = supabase
    .from("feedings")
    .select("*")
    .order("fed_at", { ascending: false });

  if (start && end) {
    query = query.gte("fed_at", start).lte("fed_at", end);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const amount_grams = Number(body.amount_grams);
  const food_type = body.food_type as FoodType;
  const fed_at = body.fed_at ?? new Date().toISOString();

  if (!amount_grams || amount_grams <= 0) {
    return NextResponse.json({ error: "Укажи количество грамм" }, { status: 400 });
  }
  if (!["dry", "treat", "home"].includes(food_type)) {
    return NextResponse.json({ error: "Неверный тип еды" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("feedings")
    .insert({ amount_grams, food_type, fed_at })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
