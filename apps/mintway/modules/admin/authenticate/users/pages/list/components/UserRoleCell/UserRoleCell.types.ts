import type { UserAdmin } from "../../../../users.types";

export interface UserRoleCellProps {
  user: UserAdmin;
  currentUserId?: string;
  isSuperadmin: boolean;
}
