import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth";

export async function GET() {
  const jar = await cookies();
  if (jar.get(SESSION_COOKIE)?.value !== process.env.APP_PASSWORD)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
}
