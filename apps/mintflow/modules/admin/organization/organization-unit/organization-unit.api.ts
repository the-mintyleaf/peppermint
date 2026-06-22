import type { QueryParams } from "@peppermint/admin";

export type OrgUnitType =
  | "ministry"
  | "department"
  | "division"
  | "section"
  | "district_office"
  | "area_office"
  | "security_agency"
  | "other";

export type OrgUnitStatus = "active" | "inactive" | "archived";
export type ConfidentialityLevel = "public" | "restricted" | "confidential" | "top_secret";
export type TaskVisibility = "all_members" | "direct_members" | "head_only";

export interface EscalationRule {
  id: string;
  triggerAfterDays: number;
  escalateToId: string;
  notifyHead: boolean;
}

export interface OrganizationUnit extends Record<string, unknown> {
  id: string;
  // Identity
  name: string;
  nameNepali: string;
  code: string;
  unitType: OrgUnitType;
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
  // Hierarchy
  parentId: string | null;
  level: number;
  sortOrder: number;
  // Kanban & Visibility
  boardIds: string[];
  taskVisibility: TaskVisibility;
  confidentialityLevel: ConfidentialityLevel;
  escalationRules: EscalationRule[];
  // Status & Audit
  status: OrgUnitStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface OrgUnitsResponse {
  data: OrganizationUnit[];
  meta: { total: number; page: number; pageSize: number };
}

const MOCK_UNITS: OrganizationUnit[] = [
  {
    id: "1",
    name: "Ministry of Home Affairs",
    nameNepali: "गृह मन्त्रालय",
    code: "MHA",
    unitType: "ministry",
    description: "Central government ministry responsible for internal affairs, security, and administration.",
    province: "Bagmati",
    district: "Kathmandu",
    municipality: "Kathmandu Metropolitan City",
    ward: "1",
    address: "Singha Durbar, Kathmandu",
    phone: "01-4211234",
    email: "info@moha.gov.np",
    fax: "01-4211235",
    website: "https://moha.gov.np",
    headName: "Ram Bahadur Thapa",
    headTitle: "Secretary",
    headPhone: "01-4211236",
    headEmail: "secretary@moha.gov.np",
    parentId: null,
    level: 0,
    sortOrder: 1,
    boardIds: [],
    taskVisibility: "direct_members",
    confidentialityLevel: "restricted",
    escalationRules: [],
    status: "active",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
    createdBy: "system",
  },
  {
    id: "2",
    name: "Department of Immigration",
    nameNepali: "आप्रवासन विभाग",
    code: "DOI",
    unitType: "department",
    description: "Handles immigration, visa, and passport services.",
    province: "Bagmati",
    district: "Kathmandu",
    municipality: "Kathmandu Metropolitan City",
    ward: "1",
    address: "Kalikasthan, Kathmandu",
    phone: "01-4422337",
    email: "info@immigration.gov.np",
    fax: "01-4422338",
    website: "https://immigration.gov.np",
    headName: "Sita Sharma",
    headTitle: "Director General",
    headPhone: "01-4422339",
    headEmail: "dg@immigration.gov.np",
    parentId: "1",
    level: 1,
    sortOrder: 1,
    boardIds: [],
    taskVisibility: "direct_members",
    confidentialityLevel: "restricted",
    escalationRules: [
      { id: "er1", triggerAfterDays: 7, escalateToId: "1", notifyHead: true },
    ],
    status: "active",
    createdAt: "2025-01-02T00:00:00Z",
    updatedAt: "2025-01-02T00:00:00Z",
    createdBy: "system",
  },
  {
    id: "3",
    name: "Department of National ID and Civil Registration",
    nameNepali: "राष्ट्रिय परिचयपत्र तथा पञ्जीकरण विभाग",
    code: "DONIDCR",
    unitType: "department",
    description: "Manages national identity cards and civil registration.",
    province: "Bagmati",
    district: "Kathmandu",
    municipality: "Kathmandu Metropolitan City",
    ward: "1",
    address: "Tripureshwor, Kathmandu",
    phone: "01-4269612",
    email: "info@donidcr.gov.np",
    fax: "",
    website: "https://donidcr.gov.np",
    headName: "Hari Prasad Adhikari",
    headTitle: "Director General",
    headPhone: "01-4269613",
    headEmail: "dg@donidcr.gov.np",
    parentId: "1",
    level: 1,
    sortOrder: 2,
    boardIds: [],
    taskVisibility: "all_members",
    confidentialityLevel: "public",
    escalationRules: [],
    status: "active",
    createdAt: "2025-01-03T00:00:00Z",
    updatedAt: "2025-01-03T00:00:00Z",
    createdBy: "system",
  },
  {
    id: "4",
    name: "Kathmandu District Administration Office",
    nameNepali: "काठमाडौं जिल्ला प्रशासन कार्यालय",
    code: "DAO-KTM",
    unitType: "district_office",
    description: "District-level administrative office for Kathmandu.",
    province: "Bagmati",
    district: "Kathmandu",
    municipality: "Kathmandu Metropolitan City",
    ward: "1",
    address: "Babar Mahal, Kathmandu",
    phone: "01-4261216",
    email: "dao.ktm@moha.gov.np",
    fax: "01-4261217",
    website: "",
    headName: "Bishnu Kumar Shrestha",
    headTitle: "Chief District Officer",
    headPhone: "01-4261218",
    headEmail: "cdo.ktm@moha.gov.np",
    parentId: "1",
    level: 1,
    sortOrder: 3,
    boardIds: [],
    taskVisibility: "direct_members",
    confidentialityLevel: "restricted",
    escalationRules: [
      { id: "er2", triggerAfterDays: 5, escalateToId: "1", notifyHead: true },
    ],
    status: "active",
    createdAt: "2025-01-04T00:00:00Z",
    updatedAt: "2025-01-04T00:00:00Z",
    createdBy: "system",
  },
  {
    id: "5",
    name: "Nepal Police Headquarters",
    nameNepali: "नेपाल प्रहरी प्रधान कार्यालय",
    code: "NPHQ",
    unitType: "security_agency",
    description: "Central command of Nepal Police.",
    province: "Bagmati",
    district: "Kathmandu",
    municipality: "Kathmandu Metropolitan City",
    ward: "3",
    address: "Naxal, Kathmandu",
    phone: "01-4412926",
    email: "info@nepalpolice.gov.np",
    fax: "",
    website: "https://nepalpolice.gov.np",
    headName: "Dasharath Dhakal",
    headTitle: "Inspector General of Police",
    headPhone: "01-4412927",
    headEmail: "igp@nepalpolice.gov.np",
    parentId: "1",
    level: 1,
    sortOrder: 4,
    boardIds: [],
    taskVisibility: "head_only",
    confidentialityLevel: "confidential",
    escalationRules: [],
    status: "active",
    createdAt: "2025-01-05T00:00:00Z",
    updatedAt: "2025-01-05T00:00:00Z",
    createdBy: "system",
  },
  {
    id: "6",
    name: "Old Archive Unit",
    nameNepali: "पुरानो अभिलेख इकाइ",
    code: "ARCH-OLD",
    unitType: "section",
    description: "Archived unit no longer in operation.",
    province: "Bagmati",
    district: "Kathmandu",
    municipality: "Kathmandu Metropolitan City",
    ward: "1",
    address: "Singha Durbar, Kathmandu",
    phone: "",
    email: "",
    fax: "",
    website: "",
    headName: "",
    headTitle: "",
    headPhone: "",
    headEmail: "",
    parentId: "1",
    level: 1,
    sortOrder: 99,
    boardIds: [],
    taskVisibility: "direct_members",
    confidentialityLevel: "restricted",
    escalationRules: [],
    status: "archived",
    createdAt: "2020-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "system",
  },
];

export async function fetchOrgUnits(params?: QueryParams): Promise<OrgUnitsResponse> {
  let data = [...MOCK_UNITS];

  if (params?.filters?.unitType) {
    data = data.filter((u) => u.unitType === params.filters!.unitType);
  }
  if (params?.filters?.status) {
    data = data.filter((u) => u.status === params.filters!.status);
  } else if (!params?.filters?.unitType) {
    // Default list excludes archived unless explicitly filtered
    data = data.filter((u) => u.status !== "archived");
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    data = data.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.nameNepali.includes(q) ||
        u.code.toLowerCase().includes(q) ||
        u.district.toLowerCase().includes(q),
    );
  }

  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  const start = (page - 1) * pageSize;

  return {
    data: data.slice(start, start + pageSize),
    meta: { total: data.length, page, pageSize },
  };
}

export async function fetchOrgUnit(id: string): Promise<OrganizationUnit> {
  const unit = MOCK_UNITS.find((u) => u.id === id);
  if (!unit) throw new Error(`OrganizationUnit not found: ${id}`);
  return unit;
}

export async function fetchOrgUnitOptions(): Promise<{ value: string; label: string }[]> {
  return MOCK_UNITS.filter((u) => u.status === "active").map((u) => ({
    value: u.id,
    label: `${u.code} — ${u.name}`,
  }));
}

export async function createOrgUnit(data: Partial<OrganizationUnit>): Promise<OrganizationUnit> {
  const now = new Date().toISOString();
  return {
    ...data,
    id: String(Date.now()),
    boardIds: [],
    escalationRules: [],
    level: 0,
    sortOrder: MOCK_UNITS.length + 1,
    createdAt: now,
    updatedAt: now,
    createdBy: "current-user",
  } as OrganizationUnit;
}

export async function updateOrgUnit(
  id: string,
  data: Partial<OrganizationUnit>,
): Promise<OrganizationUnit> {
  return { ...data, id, updatedAt: new Date().toISOString() } as OrganizationUnit;
}

export async function deleteOrgUnit(id: string): Promise<void> {
  void id;
}
