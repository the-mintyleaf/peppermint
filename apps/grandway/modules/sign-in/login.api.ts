import api from "@/lib/api";
import { getDeviceId } from "@/lib/deviceId";
import type { LoginTokens } from "@/modules/admin/authenticate/_shared/authenticate.types";

export interface LoginValues {
  username: string;
  password: string;
  /** Required only when the account has MFA enabled — `authenticate/docs/INTEGRATION.md` §7. */
  otp_code?: string;
}

/**
 * `POST /api/v1/auth/login/` — always sends the persisted `device_id` (device binding,
 * max 3 concurrent devices per account) and an optional `device_name` label.
 */
export async function login(values: LoginValues): Promise<LoginTokens> {
  const { data } = await api.post<LoginTokens>("/api/v1/auth/login/", {
    username: values.username,
    password: values.password,
    device_id: getDeviceId(),
    device_name:
      typeof navigator !== "undefined"
        ? navigator.userAgent.slice(0, 255)
        : undefined,
    ...(values.otp_code ? { otp_code: values.otp_code } : {}),
  });
  return data;
}
