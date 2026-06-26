import type { Organization } from "../organizations.types";

export interface OrganizationsFormProps {
  initialValues?: Partial<Organization>;
  onSubmit: (values: Organization) => void;
  isLoading?: boolean;
}
