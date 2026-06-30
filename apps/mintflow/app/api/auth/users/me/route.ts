import { NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://192.168.110.142:8000";

async function proxyMe(request: Request, method: "GET" | "PATCH") {
  const auth = request.headers.get("Authorization");

  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const options: RequestInit = {
    method,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
  };

  if (method === "PATCH") {
    options.body = JSON.stringify(await request.json());
  }

  const response = await fetch(`${API_URL}/api/v1/auth/me/`, options);
  const json = await response.json();

  if (!response.ok) {
    return NextResponse.json(json, { status: response.status });
  }

  // Unwrap the success envelope: { success, data: { ...user } }
  const data = json.data ?? json;
  return NextResponse.json(data);
}

export async function GET(request: Request) {
  return proxyMe(request, "GET");
}

export async function PATCH(request: Request) {
  return proxyMe(request, "PATCH");
}
