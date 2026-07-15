import type { UserAdmin } from "../../../../users.types";

export interface UserDetailDrawerProps {
  user: UserAdmin | null;
  opened: boolean;
  onClose: () => void;
  /** Gates the target-sessions tab (superadmin only). */
  isSuperadmin: boolean;
}
