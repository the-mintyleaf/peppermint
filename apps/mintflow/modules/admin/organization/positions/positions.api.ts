// Mock API — replace with real Axios calls when backend is wired.
// Real endpoints:
//   GET   /api/v1/organization/units/<unit_id>/positions/   (unit-scoped)
//   POST  /api/v1/organization/units/<unit_id>/positions/
//   GET   /api/v1/organization/positions/<id>/
//   POST  /api/v1/organization/positions/<id>/deactivate/   { reason?: "" }
// Note: No org-level list endpoint exists in this API version.
//   Real implementation: aggregate across unit endpoints or request
//   a ?organization_id= filter on a future /positions/ root endpoint.
import type { QueryParams } from "@peppermint/admin";
import type { Position, PositionsFetchResponse } from "./positions.types";

const MOCK_UNIT_A = "unit-aaa-111";
const MOCK_UNIT_B = "unit-bbb-222";

const MOCK_POSITIONS: Position[] = [
  {
    id: "pos-001",
    organization: "11111111-1111-4111-8111-111111111111",
    unit: MOCK_UNIT_A,
    title: "Director General",
    code: "dg-001",
    position_type: "executive",
    status: "active",
    description: "Leads the organisation at the executive level.",
    is_leadership: true,
    is_supervisory: true,
    is_single_occupant: true,
    max_occupants: 1,
    effective_from: "2024-01-01T00:00:00Z",
    effective_to: null,
    is_active: true,
    created_at: "2024-01-01T09:00:00Z",
    updated_at: "2026-01-01T09:00:00Z",
  },
  {
    id: "pos-002",
    organization: "11111111-1111-4111-8111-111111111111",
    unit: MOCK_UNIT_A,
    title: "Senior Health Officer",
    code: "sho-001",
    position_type: "officer",
    status: "active",
    description: "Oversees health programme delivery.",
    is_leadership: false,
    is_supervisory: true,
    is_single_occupant: false,
    max_occupants: 3,
    effective_from: "2024-01-01T00:00:00Z",
    effective_to: null,
    is_active: true,
    created_at: "2024-01-05T09:00:00Z",
    updated_at: "2026-03-01T09:00:00Z",
  },
  {
    id: "pos-003",
    organization: "11111111-1111-4111-8111-111111111111",
    unit: MOCK_UNIT_B,
    title: "Data Analyst",
    code: "da-001",
    position_type: "analyst",
    status: "draft",
    description: "Analyses programme data and prepares reports.",
    is_leadership: false,
    is_supervisory: false,
    is_single_occupant: true,
    max_occupants: 1,
    effective_from: null,
    effective_to: null,
    is_active: true,
    created_at: "2026-05-10T09:00:00Z",
    updated_at: "2026-05-10T09:00:00Z",
  },
  {
    id: "pos-004",
    organization: "11111111-1111-4111-8111-111111111111",
    unit: MOCK_UNIT_B,
    title: "Field Coordinator",
    code: "fc-001",
    position_type: "field_staff",
    status: "inactive",
    description: "Coordinates field operations across districts.",
    is_leadership: false,
    is_supervisory: false,
    is_single_occupant: false,
    max_occupants: 5,
    effective_from: "2023-01-01T00:00:00Z",
    effective_to: "2025-12-31T00:00:00Z",
    is_active: false,
    created_at: "2023-01-01T09:00:00Z",
    updated_at: "2026-01-01T09:00:00Z",
  },
];

function delay(ms = 250) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export async function fetchPositions(
  orgId: string,
  params?: QueryParams,
): Promise<PositionsFetchResponse> {
  await delay();
  let data = MOCK_POSITIONS.filter((p) => p.organization === orgId);
  const statusFilter = params?.filters?.status as string | undefined;
  if (statusFilter) {
    data = data.filter((p) => p.status === statusFilter);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    data = data.filter(
      (p) =>
        p.title.toLowerCase().includes(q) || p.code.toLowerCase().includes(q),
    );
  }
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  return {
    data: paginate(data, page, pageSize),
    meta: { total: data.length, page, pageSize },
  };
}

export async function fetchPosition(id: string): Promise<Position> {
  await delay(200);
  const pos = MOCK_POSITIONS.find((p) => p.id === id);
  if (!pos) throw new Error("Position not found");
  return pos;
}

export async function createPosition(
  unitId: string,
  values: Partial<Position>,
): Promise<Position> {
  await delay(300);
  return {
    title: "",
    code: "",
    position_type: "officer",
    status: "draft",
    description: "",
    is_leadership: false,
    is_supervisory: false,
    is_single_occupant: true,
    max_occupants: 1,
    effective_from: null,
    effective_to: null,
    ...values,
    id: crypto.randomUUID(),
    unit: unitId,
    organization: values.organization ?? "",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as Position;
}

export async function deactivatePosition(
  id: string,
  reason?: string,
): Promise<Position> {
  await delay(300);
  void reason;
  const pos = MOCK_POSITIONS.find((p) => p.id === id);
  return {
    ...pos,
    id,
    status: "inactive",
    is_active: false,
    updated_at: new Date().toISOString(),
  } as Position;
}
