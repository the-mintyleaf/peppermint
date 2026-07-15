import type { UserAdmin } from "../../../../users.types";

export interface UserRowActionsMenuProps {
  user: UserAdmin;
  /** The signed-in admin's id — used to hide self-destructive actions. */
  currentUserId?: string;
  /** Superadmin-only actions (suspend/unsuspend/reset/revoke) are gated on this. */
  isSuperadmin: boolean;
  onViewDetails: (user: UserAdmin) => void;
}
