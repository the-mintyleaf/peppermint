import type {
  ConfidentialityLevel,
  OrgUnitType,
  TaskVisibility,
} from "./module.api";

export const ORGANIZATION_BASE_PATH = "/admin/organization";

export const UNIT_TYPE_OPTIONS: { value: OrgUnitType; label: string }[] = [
  { value: "ministry", label: "Ministry" },
  { value: "department", label: "Department" },
  { value: "division", label: "Division" },
  { value: "section", label: "Section" },
  { value: "district_office", label: "District Administration Office" },
  { value: "area_office", label: "Area Administration Office" },
  { value: "security_agency", label: "Security Agency" },
  { value: "other", label: "Other" },
];

export const CONFIDENTIALITY_OPTIONS: { value: ConfidentialityLevel; label: string }[] = [
  { value: "public", label: "Public" },
  { value: "restricted", label: "Restricted" },
  { value: "confidential", label: "Confidential" },
  { value: "top_secret", label: "Top Secret" },
];

export const TASK_VISIBILITY_OPTIONS: { value: TaskVisibility; label: string }[] = [
  { value: "all_members", label: "All Members" },
  { value: "direct_members", label: "Direct Members" },
  { value: "head_only", label: "Head Only" },
];

export const UNIT_TYPE_COLORS: Record<OrgUnitType, string> = {
  ministry: "violet",
  department: "blue",
  division: "cyan",
  section: "teal",
  district_office: "orange",
  area_office: "yellow",
  security_agency: "red",
  other: "gray",
};

export const CONFIDENTIALITY_COLORS: Record<ConfidentialityLevel, string> = {
  public: "green",
  restricted: "yellow",
  confidential: "orange",
  top_secret: "red",
};

export function getUnitTypeLabel(type: OrgUnitType): string {
  return UNIT_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

export function getConfidentialityLabel(level: ConfidentialityLevel): string {
  return CONFIDENTIALITY_OPTIONS.find((option) => option.value === level)?.label ?? level;
}

export function getOwnershipScopeLabel(scope: TaskVisibility): string {
  return TASK_VISIBILITY_OPTIONS.find((option) => option.value === scope)?.label ?? scope;
}
