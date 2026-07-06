import type { Role } from "../../../roles.types";

export interface RolePermissionsDrawerProps {
  role: Role | null;
  opened: boolean;
  onClose: () => void;
}
