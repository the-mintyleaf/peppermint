import type { ConfidentialityLevel, OrgUnitStatus, OrgUnitType, TaskVisibility } from "../module.api";

export interface OrgUnitFormValues extends Record<string, unknown> {
  // Identity
  name: string;
  nameNepali: string;
  code: string;
  unitType: OrgUnitType | "";
  description: string;
  // Location
  province: string;
  district: string;
  municipality: string;
  ward: string;
  address: string;
  // Contact
  phone: string;
  email: string;
  fax: string;
  website: string;
  // Office Head
  headName: string;
  headTitle: string;
  headPhone: string;
  headEmail: string;
  // Settings
  parentId: string;
  taskVisibility: TaskVisibility;
  confidentialityLevel: ConfidentialityLevel;
  status: OrgUnitStatus;
}
