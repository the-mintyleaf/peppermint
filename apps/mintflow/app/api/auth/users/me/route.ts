import { NextResponse } from "next/server";
import { mockUser } from "@/lib/auth/mock-auth";

export async function GET(request: Request) {
  const auth = request.headers.get("Authorization");

  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(mockUser);
}
