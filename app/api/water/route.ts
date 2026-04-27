import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { SESSION_COOKIE } from "@/lib/auth";

export async function PUT() {
  const jar = await cookies();
  if (jar.get(SESSION_COOKIE)?.value !== process.env.APP_PASSWORD)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("settings")
    .update({ water_changed_at: new Date().toISOString() })
    .eq("id", 1)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
