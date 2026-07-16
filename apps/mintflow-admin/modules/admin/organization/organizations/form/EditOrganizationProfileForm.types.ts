import type { Organization } from "../organizations.types";

export interface EditOrganizationProfileFormValues {
  name_np: string;
  name_en: string;
  legal_name_np: string;
  short_name_np: string;
  short_name_en: string;
  description: string;
  country_code: string;
  timezone: string;
  sort_order: number;
}

export interface EditOrganizationProfileFormProps {
  organization: Organization;
  onSubmit: (values: EditOrganizationProfileFormValues) => void;
  isLoading?: boolean;
}
