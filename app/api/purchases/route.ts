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

  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .order("purchased_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!(await isAuthorized()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const amount_grams = Number(body.amount_grams);

  if (!amount_grams || amount_grams <= 0)
    return NextResponse.json({ error: "Укажи количество грамм" }, { status: 400 });

  const { data, error } = await supabase
    .from("purchases")
    .insert({ amount_grams })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
