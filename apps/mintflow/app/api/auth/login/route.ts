import { NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://192.168.110.142:8000";

export async function POST(request: Request) {
  const body = await request.json();

  // SignInPage sends { username, password } — backend expects { identifier, password }
  const { username, email, password, ...rest } = body as Record<string, string>;
  const backendBody = {
    identifier: username ?? email,
    password,
    ...rest,
  };

  const response = await fetch(`${API_URL}/api/v1/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(backendBody),
  });

  const json = await response.json();

  if (!response.ok) {
    // Forward the error envelope as-is — SignInPage calls onError(data)
    return NextResponse.json(json, { status: response.status });
  }

  // Unwrap the success envelope: { success, data: { access, refresh, user, mfa_required?, challenge_id? } }
  const data = json.data ?? json;
  return NextResponse.json(data);
}
