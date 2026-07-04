import type { Organization } from "../organizations.types";

export interface EditOrganizationProfileFormValues {
  name: string;
  legal_name: string;
  short_name: string;
  description: string;
  country_code: string;
  timezone: string;
}

export interface EditOrganizationProfileFormProps {
  organization: Organization;
  onSubmit: (values: EditOrganizationProfileFormValues) => void;
  isLoading?: boolean;
}
