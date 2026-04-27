import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { SESSION_COOKIE } from "@/lib/auth";
import type { FoodType } from "@/lib/types";

async function isAuthorized(): Promise<boolean> {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE);
  return session?.value === process.env.APP_PASSWORD;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const amount_grams = Number(body.amount_grams);
  const food_type = body.food_type as FoodType;
  const fed_at = body.fed_at;

  if (!amount_grams || amount_grams <= 0) {
    return NextResponse.json({ error: "Укажи количество грамм" }, { status: 400 });
  }
  if (!["dry", "treat", "home"].includes(food_type)) {
    return NextResponse.json({ error: "Неверный тип еды" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("feedings")
    .update({ amount_grams, food_type, fed_at })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabase.from("feedings").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
