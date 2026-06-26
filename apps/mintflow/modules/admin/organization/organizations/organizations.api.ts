// Mock API — replace with real Axios calls when backend is wired
// Real endpoints:
//   GET    /api/v1/organization/organizations/
//   POST   /api/v1/organization/organizations/
//   GET    /api/v1/organization/organizations/<id>/
//   PATCH  /api/v1/organization/organizations/<id>/
//   POST   /api/v1/organization/organizations/<id>/status/
import type { QueryParams } from "@peppermint/admin";
import type {
  Organization,
  OrganizationsFetchResponse,
  ChangeStatusPayload,
} from "./organizations.types";

const MOCK_ORGS: Organization[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Ministry of Health",
    code: "moh",
    organization_type: "ministry",
    status: "active",
    parent_organization: null,
    legal_name: "Ministry of Health and Social Welfare",
    short_name: "MoH",
    description: "Primary health policy and oversight body.",
    country_code: "UG",
    timezone: "Africa/Kampala",
    is_active: true,
    created_at: "2026-01-10T09:00:00Z",
    updated_at: "2026-06-01T12:00:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "National Planning Authority",
    code: "npa",
    organization_type: "agency",
    status: "active",
    parent_organization: null,
    legal_name: "National Planning Authority",
    short_name: "NPA",
    description: "Coordinates national development planning.",
    country_code: "UG",
    timezone: "Africa/Kampala",
    is_active: true,
    created_at: "2026-01-15T09:00:00Z",
    updated_at: "2026-05-20T08:30:00Z",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Digital Transformation Unit",
    code: "dtu",
    organization_type: "division",
    status: "draft",
    parent_organization: null,
    legal_name: "",
    short_name: "DTU",
    description: "Leads digital transformation initiatives across government.",
    country_code: "UG",
    timezone: "Africa/Kampala",
    is_active: true,
    created_at: "2026-06-01T10:00:00Z",
    updated_at: "2026-06-01T10:00:00Z",
  },
];

function delay(ms = 250) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export async function fetchOrganizations(
  params?: QueryParams,
): Promise<OrganizationsFetchResponse> {
  await delay();
  let data = [...MOCK_ORGS];
  const statusFilter = params?.filters?.status as string | undefined;
  if (statusFilter) {
    data = data.filter((o) => o.status === statusFilter);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    data = data.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.code.toLowerCase().includes(q) ||
        o.short_name.toLowerCase().includes(q),
    );
  }
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  return {
    data: paginate(data, page, pageSize),
    meta: { total: data.length, page, pageSize },
  };
}

export async function createOrganization(
  values: Partial<Organization>,
): Promise<Organization> {
  await delay(300);
  return {
    ...values,
    id: crypto.randomUUID(),
    status: "draft",
    parent_organization: null,
    legal_name: values.legal_name ?? "",
    short_name: values.short_name ?? "",
    description: values.description ?? "",
    country_code: values.country_code ?? "",
    timezone: values.timezone ?? "",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as Organization;
}

export async function updateOrganization(
  id: string,
  values: Partial<Organization>,
): Promise<Organization> {
  await delay(300);
  const existing = MOCK_ORGS.find((o) => o.id === id);
  return {
    ...existing,
    ...values,
    id,
    updated_at: new Date().toISOString(),
  } as Organization;
}

export async function deleteOrganization(id: string): Promise<void> {
  await delay(200);
  void id;
}

export async function changeOrganizationStatus(
  id: string,
  payload: ChangeStatusPayload,
): Promise<Organization> {
  await delay(300);
  const existing = MOCK_ORGS.find((o) => o.id === id);
  return {
    ...existing,
    id,
    status: payload.status,
    is_active: payload.status === "active",
    updated_at: new Date().toISOString(),
  } as Organization;
}
