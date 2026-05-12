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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthorized(request)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { error } = await supabase.from("purchases").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
