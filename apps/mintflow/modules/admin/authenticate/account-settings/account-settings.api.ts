import api from "@/lib/api";
import type { CurrentUser } from "@/modules/admin/authenticate/_shared/authenticate.types";
import type {
  MfaConfirmResponse,
  MfaRecoveryCodesResponse,
  MfaSetupResponse,
  ProfileUpdateValues,
  RevokeAllResponse,
  UserSession,
} from "./account-settings.types";

// ─── Profile ────────────────────────────────────────────────────────────────

export async function updateProfile(
  values: Partial<ProfileUpdateValues>,
): Promise<CurrentUser> {
  const { data } = await api.patch<CurrentUser>("/api/v1/auth/me/", values);
  return data;
}

// ─── MFA (TOTP) ───────────────────────────────────────────────────────────────

export async function setupMfa(): Promise<MfaSetupResponse> {
  const { data } = await api.post<MfaSetupResponse>(
    "/api/v1/auth/mfa/totp/setup/",
  );
  return data;
}

export async function confirmMfa(code: string): Promise<MfaConfirmResponse> {
  const { data } = await api.post<MfaConfirmResponse>(
    "/api/v1/auth/mfa/totp/confirm/",
    { code },
  );
  return data;
}

export async function disableMfa(): Promise<void> {
  await api.post("/api/v1/auth/mfa/disable/");
}

export async function regenerateRecoveryCodes(): Promise<MfaRecoveryCodesResponse> {
  const { data } = await api.post<MfaRecoveryCodesResponse>(
    "/api/v1/auth/mfa/recovery-codes/regenerate/",
  );
  return data;
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function fetchSessions(): Promise<UserSession[]> {
  const { data } = await api.get<{ data: UserSession[] }>(
    "/api/v1/auth/sessions/",
  );
  return data.data;
}

export async function revokeSession(id: string): Promise<void> {
  await api.post(`/api/v1/auth/sessions/${id}/revoke/`);
}

export async function revokeAllSessions(): Promise<RevokeAllResponse> {
  const { data } = await api.post<RevokeAllResponse>(
    "/api/v1/auth/sessions/revoke-all/",
  );
  return data;
}
