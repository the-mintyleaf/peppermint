import api from "@/lib/api";
import { readCsrfHeader } from "@/lib/csrf";
import type { SessionDevice } from "@/modules/admin/authenticate/_shared/authenticate.types";
import type { LogoutAllResponse } from "./account-settings.types";

/** `GET /api/v1/auth/sessions/` — the signed-in user's known-device sessions. */
export async function fetchSessions(): Promise<SessionDevice[]> {
  const { data } = await api.get<SessionDevice[]>("/api/v1/auth/sessions/");
  return data;
}

/**
 * `POST /api/v1/auth/logout-all/` (bearer + CSRF). Revokes every session, bumps the
 * token version (invalidating all outstanding tokens), and clears the refresh cookie.
 */
export async function logoutAllSessions(): Promise<LogoutAllResponse> {
  const { data } = await api.post<LogoutAllResponse>(
    "/api/v1/auth/logout-all/",
    undefined,
    { headers: readCsrfHeader() },
  );
  return data;
}
