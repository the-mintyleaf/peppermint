import type { Organization } from "../../../../organizations.types";

export interface OrganizationRowActionsMenuProps {
  organization: Organization;
  onSelect: (organization: Organization) => void;
}
