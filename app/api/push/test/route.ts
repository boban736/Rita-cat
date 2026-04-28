import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { sendPushToAll } from "@/lib/webpush";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const jar = await cookies();
  if (jar.get(SESSION_COOKIE)?.value !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const title = (body.title as string | undefined) ?? "🐱 Тест уведомление";
  const text = (body.body as string | undefined) ?? "Push работает!";

  const { count } = await supabase
    .from("push_subscriptions")
    .select("*", { count: "exact", head: true });

  try {
    await sendPushToAll(title, text);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "push send failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ sent: count ?? 0 });
}
