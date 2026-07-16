import type { User } from "../../../../users.types";

export interface UserDetailDrawerProps {
  user: User | null;
  opened: boolean;
  onClose: () => void;
}
