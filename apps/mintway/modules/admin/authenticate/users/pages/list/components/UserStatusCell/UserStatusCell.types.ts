import type { UserAdmin } from "../../../../users.types";

export interface UserStatusCellProps {
  user: UserAdmin;
  currentUserId?: string;
  isSuperadmin: boolean;
}
