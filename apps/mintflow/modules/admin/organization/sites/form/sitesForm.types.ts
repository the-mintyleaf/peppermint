import type { Site } from "../sites.types";

export interface SitesFormProps {
  initialValues?: Site;
  onSubmit: (values: Partial<Site>) => void;
  isLoading?: boolean;
}
