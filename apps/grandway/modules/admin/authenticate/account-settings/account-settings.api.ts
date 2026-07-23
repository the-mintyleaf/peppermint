import api from "@/lib/api";
import type { Session } from "@/modules/admin/authenticate/_shared/authenticate.types";

/** `GET /api/v1/auth/sessions/` — the signed-in user's active sessions (API §7). */
export async function fetchSessions(): Promise<Session[]> {
  const { data } = await api.get<Session[]>("/api/v1/auth/sessions/");
  return data;
}

export interface RevokeSessionsParams {
  session_id?: string;
  others_only?: boolean;
}

export interface RevokeSessionsResult {
  revoked: number;
}

/**
 * `POST /api/v1/auth/sessions/revoke/` — API §7. Omit both params to revoke ALL of the
 * caller's sessions; `session_id` revokes one; `others_only` revokes every session
 * except the current one.
 */
export async function revokeSessions(
  params: RevokeSessionsParams = {},
): Promise<RevokeSessionsResult> {
  const { data } = await api.post<RevokeSessionsResult>(
    "/api/v1/auth/sessions/revoke/",
    params,
  );
  return data;
}
