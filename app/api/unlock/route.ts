import { NextResponse } from "next/server";
import { UNLOCK_CODE, UNLOCK_COOKIE } from "@/lib/unlock";

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const unlocked = cookie.split(";").some((part) => part.trim() === `${UNLOCK_COOKIE}=1`);
  return NextResponse.json({ unlocked });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { pin?: string } | null;
  const pin = String(body?.pin ?? "").trim();
  if (pin !== UNLOCK_CODE) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(UNLOCK_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(UNLOCK_COOKIE, "", { httpOnly: true, maxAge: 0, path: "/" });
  return response;
}
