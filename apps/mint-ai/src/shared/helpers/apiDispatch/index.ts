import { request } from "undici";
import { PropApiDispatchStructured } from "./apiDispatch.type";

// ? Helper: build query string from params
function toQueryString(params?: Record<string, any>): string {
  if (!params) return "";
  const qs = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return qs ? `?${qs}` : "";
}
2;

// ? GET: only params (as query string) and headers allowed!
async function get(
  url: string,
  params?: Record<string, any>,
  headers?: Record<string, any>
) {
  const fullUrl = url + toQueryString(params);
  const res = await request(fullUrl, { method: "GET", headers });
  const data = await res.body.json().catch(() => null);
  const structured: PropApiDispatchStructured = {
    status: res.statusCode,
    data,
  };

  console.log;

  return structured;
}

// ? POST: JSON body (stringified), plus headers
async function post(url: string, body?: any, headers?: Record<string, any>) {
  const res = await request(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.body.json().catch(() => null);
  const structured: PropApiDispatchStructured = {
    status: res.statusCode,
    data,
  };

  return structured;
}

export const apiDispatch: any = {
  get,
  post,
  put: () => {},
  patch: () => {},
  delete: () => {},
};
