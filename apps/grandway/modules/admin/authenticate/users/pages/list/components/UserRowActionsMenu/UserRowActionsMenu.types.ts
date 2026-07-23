import type { User } from "../../../../users.types";

export interface UserRowActionsMenuProps {
  user: User;
  onViewDetails: (user: User) => void;
}
