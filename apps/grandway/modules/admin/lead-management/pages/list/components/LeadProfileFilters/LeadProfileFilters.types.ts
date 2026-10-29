import type { LeadListFilters } from "../../../../leadManagement.types";

export interface LeadProfileFiltersProps {
  value: LeadListFilters;
  onChange: (next: LeadListFilters) => void;
}
