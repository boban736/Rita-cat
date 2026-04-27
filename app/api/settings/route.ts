import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { SESSION_COOKIE } from "@/lib/auth";

async function isAuthorized(): Promise<boolean> {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE);
  return session?.value === process.env.APP_PASSWORD;
}

export async function GET() {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const dry_limit_grams = Number(body.dry_limit_grams);

  if (!dry_limit_grams || dry_limit_grams <= 0) {
    return NextResponse.json({ error: "Укажи лимит" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("settings")
    .update({ dry_limit_grams, updated_at: new Date().toISOString() })
    .eq("id", 1)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
