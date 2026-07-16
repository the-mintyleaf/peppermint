import type { User } from "../../../../users.types";

export interface UserRowActionsMenuProps {
  user: User;
  isSelf: boolean;
  onViewDetails: (user: User) => void;
}
