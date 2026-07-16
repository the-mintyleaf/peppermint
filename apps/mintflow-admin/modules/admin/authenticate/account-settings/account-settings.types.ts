import type { CurrentUser } from "@/modules/admin/authenticate/_shared/authenticate.types";

/** Shared props every settings tab receives — used to render its overview header. */
export interface SettingsTabProps {
  title: string;
  description: string;
}

export interface ProfileUpdateValues {
  display_name: string;
  email: string;
}

export interface ProfileFormProps {
  user: CurrentUser;
  /** Called after a successful save so the caller can leave the edit screen. */
  onSaved: () => void;
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
