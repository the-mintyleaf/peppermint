import type { OrganizationType } from "../organizations.types";

export interface CreateOrganizationFormValues {
  name_np: string;
  name_en: string;
  code: string;
  organization_type: OrganizationType | "";
  legal_name_np: string;
  short_name_np: string;
  short_name_en: string;
  description: string;
  country_code: string;
  timezone: string;
  sort_order: number;
}

export interface CreateOrganizationFormProps {
  onSubmit: (values: CreateOrganizationFormValues) => void;
  isLoading?: boolean;
  codeError?: string;
}
