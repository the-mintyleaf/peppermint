// Mock API — no public endpoint in this version of the org app.
// Real endpoints (when exposed): GET/POST /api/v1/organization/organizations/<org_id>/sites/
import type { QueryParams } from "@peppermint/admin";
import type {
  CreateSitePayload,
  Site,
  SitesFetchResponse,
} from "./sites.types";

const ORG_MOH = "11111111-1111-4111-8111-111111111111";
const ORG_NPA = "22222222-2222-4222-8222-222222222222";

let MOCK_SITES: Site[] = [
  {
    id: "s1000001-0001-4001-8001-000000000001",
    organization: ORG_MOH,
    name: "MOH Headquarters",
    code: "moh-hq",
    site_type: "headquarters",
    address_line_1: "Plot 6, Lourdel Road",
    address_line_2: "",
    city: "Kampala",
    province_state: "Central",
    district: "Kampala",
    country_code: "UG",
    postal_code: "",
    latitude: "0.317100",
    longitude: "32.581300",
    is_active: true,
    created_at: "2024-03-01T09:00:00Z",
    updated_at: "2024-03-01T09:00:00Z",
  },
  {
    id: "s1000002-0002-4002-8002-000000000002",
    organization: ORG_MOH,
    name: "Mulago Hospital Annex",
    code: "moh-mulago",
    site_type: "field_office",
    address_line_1: "Mulago Hill Road",
    address_line_2: "",
    city: "Kampala",
    province_state: "Central",
    district: "Kawempe",
    country_code: "UG",
    postal_code: "",
    latitude: null,
    longitude: null,
    is_active: true,
    created_at: "2024-04-10T09:00:00Z",
    updated_at: "2024-04-10T09:00:00Z",
  },
  {
    id: "s1000003-0003-4003-8003-000000000003",
    organization: ORG_NPA,
    name: "NPA Head Office",
    code: "npa-hq",
    site_type: "headquarters",
    address_line_1: "15 Clement Hill Road",
    address_line_2: "Nakasero",
    city: "Kampala",
    province_state: "Central",
    district: "Kampala",
    country_code: "UG",
    postal_code: "",
    latitude: null,
    longitude: null,
    is_active: true,
    created_at: "2023-08-01T09:00:00Z",
    updated_at: "2023-08-01T09:00:00Z",
  },
];

function delay(ms = 250) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export async function fetchSites(
  orgId: string,
  params?: QueryParams,
): Promise<SitesFetchResponse> {
  await delay();
  let data = MOCK_SITES.filter((s) => s.organization === orgId);

  const activeFilter = params?.filters?.is_active as string | undefined;
  if (activeFilter === "true") {
    data = data.filter((s) => s.is_active);
  } else if (activeFilter === "false") {
    data = data.filter((s) => !s.is_active);
  }

  if (params?.search) {
    const q = params.search.toLowerCase();
    data = data.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q),
    );
  }

  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  return {
    data: paginate(data, page, pageSize),
    meta: { total: data.length, page, pageSize },
  };
}

export async function createSite(
  orgId: string,
  values: CreateSitePayload,
): Promise<Site> {
  await delay(300);
  const now = new Date().toISOString();
  const site: Site = {
    id: crypto.randomUUID(),
    organization: orgId,
    ...values,
    latitude: null,
    longitude: null,
    is_active: true,
    created_at: now,
    updated_at: now,
  };
  MOCK_SITES = [...MOCK_SITES, site];
  return site;
}
