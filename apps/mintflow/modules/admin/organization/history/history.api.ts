// Mock API — replace with real Axios calls when backend is wired.
// Real endpoint:
//   GET /api/v1/organization/organizations/<org_id>/events/
//        query params: page, page_size, event_type, acting_assignment
// Response uses snake_case — map to camelCase before returning.
// Note: OrganizationEventLog fields are camelCase in this codebase (see organization.types.ts).
import type {
  HistoryFetchParams,
  HistoryFetchResponse,
  OrganizationEventLog,
} from "./history.types";

const MOCK_ORG_ID = "11111111-1111-4111-8111-111111111111";

const MOCK_EVENTS: OrganizationEventLog[] = [
  {
    id: "evt-001",
    organization: MOCK_ORG_ID,
    actor: "user-actor-001",
    eventType: "organization_status_changed",
    objectType: "organization",
    objectId: MOCK_ORG_ID,
    objectKey: "min-health",
    summary: "Organisation status changed from 'draft' to 'active'.",
    detail: "",
    reason: "Approved by board resolution 2026-01-15.",
    actingAssignment: null,
    previousState: { status: "draft" },
    newState: { status: "active" },
    requestId: "req-001",
    source: "api",
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "evt-002",
    organization: MOCK_ORG_ID,
    actor: "user-actor-001",
    eventType: "unit_created",
    objectType: "organization_unit",
    objectId: "unit-aaa-111",
    objectKey: "executive-office",
    summary: "Unit 'Executive Office' created.",
    detail: "",
    reason: "",
    actingAssignment: "asgn-dg-001",
    previousState: null,
    newState: { name: "Executive Office", code: "executive-office" },
    requestId: "req-002",
    source: "api",
    createdAt: "2026-01-20T09:00:00Z",
  },
  {
    id: "evt-003",
    organization: MOCK_ORG_ID,
    actor: "user-actor-001",
    eventType: "position_created",
    objectType: "position",
    objectId: "pos-001",
    objectKey: "dg-001",
    summary: "Position 'Director General' created.",
    detail: "",
    reason: "",
    actingAssignment: null,
    previousState: null,
    newState: { title: "Director General", code: "dg-001", status: "draft" },
    requestId: "req-003",
    source: "api",
    createdAt: "2026-02-01T09:00:00Z",
  },
  {
    id: "evt-004",
    organization: MOCK_ORG_ID,
    actor: "user-actor-002",
    eventType: "delegation_created",
    objectType: "authority_delegation",
    objectId: "del-001",
    objectKey: "del-001",
    summary:
      "Delegation created from 'Director General' to 'Deputy Director General'.",
    detail: "",
    reason: "Director General on annual leave.",
    actingAssignment: "asgn-dg-001",
    previousState: null,
    newState: {
      from_assignment: "asgn-dg-001",
      to_assignment: "asgn-ddg-001",
      delegation_type: "acting_authority",
    },
    requestId: "req-004",
    source: "api",
    createdAt: "2026-05-28T09:00:00Z",
  },
  {
    id: "evt-005",
    organization: MOCK_ORG_ID,
    actor: "user-actor-001",
    eventType: "unit_moved",
    objectType: "organization_unit",
    objectId: "unit-bbb-222",
    objectKey: "data-analytics",
    summary: "Unit 'Data & Analytics' moved to a new parent.",
    detail: "",
    reason: "Restructuring following 2026 review.",
    actingAssignment: "asgn-dg-001",
    previousState: { parent: null },
    newState: { parent: "unit-aaa-111" },
    requestId: "req-005",
    source: "api",
    createdAt: "2026-06-10T14:30:00Z",
  },
];

function delay(ms = 250) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export async function fetchEvents(
  orgId: string,
  params: HistoryFetchParams = {},
): Promise<HistoryFetchResponse> {
  await delay();
  void orgId;
  let data = [...MOCK_EVENTS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  if (params.eventType) {
    data = data.filter((e) => e.eventType === params.eventType);
  }
  if (params.actingAssignment) {
    const q = params.actingAssignment.toLowerCase();
    data = data.filter(
      (e) =>
        (e.actingAssignment ?? "").toLowerCase().includes(q) ||
        (e.actor ?? "").toLowerCase().includes(q),
    );
  }
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  return {
    data: data.slice(start, start + pageSize),
    meta: { total: data.length, page, pageSize },
  };
}
