import type { OrganizationType } from "../organizations.types";

export interface CreateOrganizationFormValues {
  name: string;
  code: string;
  organization_type: OrganizationType | "";
  legal_name: string;
  short_name: string;
  description: string;
  country_code: string;
  timezone: string;
}

export interface CreateOrganizationFormProps {
  onSubmit: (values: CreateOrganizationFormValues) => void;
  isLoading?: boolean;
  codeError?: string;
}
