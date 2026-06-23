import { NextResponse } from "next/server";
import { createMockAuthTokens } from "@/lib/auth/mock-auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; username?: string };
  const email = body.email ?? body.username ?? "user@mintflow.app";

  const { access, refresh } = createMockAuthTokens(email);

  return NextResponse.json({ access, refresh });
}
