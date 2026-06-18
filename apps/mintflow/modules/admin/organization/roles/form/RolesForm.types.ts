import type { Role } from "../roles.types";

export interface RolesFormProps {
  initialValues?: Partial<Role>;
  onSubmit: (values: Role) => void;
  isLoading?: boolean;
}
