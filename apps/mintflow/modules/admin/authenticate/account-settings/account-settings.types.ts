import type { CurrentUser } from "@/modules/admin/authenticate/_shared/authenticate.types";

export interface ProfileUpdateValues {
  display_name: string;
  email: string;
}

export interface ProfileFormProps {
  user: CurrentUser;
}

export interface MfaSetupResponse {
  provisioning_uri: string;
  secret: string;
}

export interface MfaConfirmResponse {
  recovery_codes: string[];
}

export interface MfaRecoveryCodesResponse {
  recovery_codes: string[];
}

export interface UserSession {
  id: string;
  device_label: string | null;
  ip_address: string | null;
  issued_at: string;
  last_seen_at: string | null;
  expires_at: string;
  is_active: boolean;
}

export interface RevokeAllResponse {
  revoked_count: number;
}
