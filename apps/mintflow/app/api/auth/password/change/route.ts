import { NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://192.168.110.142:8000";

export async function POST(request: Request) {
  const auth = request.headers.get("Authorization");

  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const response = await fetch(`${API_URL}/api/v1/auth/change-password/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
    body: JSON.stringify(body),
  });

  const json = await response.json();

  if (!response.ok) {
    return NextResponse.json(json, { status: response.status });
  }

  return NextResponse.json(json.data ?? json);
}
