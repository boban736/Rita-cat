import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { checkBearer, SESSION_COOKIE } from "@/lib/auth";

async function isAuthorized(request: Request): Promise<boolean> {
  const authHeader = request.headers.get("Authorization");
  if (authHeader) return checkBearer(authHeader);
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value === process.env.APP_PASSWORD;
}

export async function GET(request: Request) {
  if (!(await isAuthorized(request)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("procedures")
    .select("*")
    .order("performed_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!(await isAuthorized(request)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const title = String(body.title ?? "").trim();

  if (!title)
    return NextResponse.json({ error: "Укажи название" }, { status: 400 });

  const { data, error } = await supabase
    .from("procedures")
    .insert({
      title,
      performed_at: body.performed_at ?? new Date().toISOString(),
      description: body.description ?? null,
      cost: Number(body.cost) || 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
