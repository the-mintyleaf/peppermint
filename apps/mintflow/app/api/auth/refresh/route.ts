import { NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://192.168.110.142:8000";

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(`${API_URL}/api/v1/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await response.json();

  if (!response.ok) {
    return NextResponse.json(json, { status: response.status });
  }

  // Unwrap: { success, data: { access, refresh } }
  return NextResponse.json(json.data ?? json);
}
