import type {
  AuthorityType,
  User,
} from "@/modules/admin/authenticate/_shared/authenticate.types";

export type { User, AuthorityType };

/** Create-account form values (`POST /api/v1/auth/users/`, API §7). */
export interface CreateUserValues extends Record<string, unknown> {
  username: string;
  display_name: string;
  full_name_np: string;
  full_name_en: string;
  email: string;
  phone: string;
  /** Empty = let the server auto-generate a temporary password. */
  password: string;
}

/** The API payload — `authority_type` is fixed to the tier the caller manages, computed
 * by the caller rather than exposed as a form field (§7 — the caller may only create
 * one tier). */
export interface CreateUserApiPayload extends CreateUserValues {
  authority_type: AuthorityType;
}

/** Profile-update form values (`PATCH /api/v1/auth/users/<id>/`, API §7). */
export interface UpdateUserValues extends Record<string, unknown> {
  display_name: string;
  full_name_np: string;
  full_name_en: string;
  email: string;
  phone: string;
}
