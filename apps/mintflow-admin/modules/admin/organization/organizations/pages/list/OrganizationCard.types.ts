import type { Organization } from "../../organizations.types";

export interface OrganizationCardProps {
  organization: Organization;
  onSelect: (organization: Organization) => void;
}
