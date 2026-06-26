// Mock API — replace with real Axios calls when backend is wired
// Real endpoints:
//   GET    /api/v1/organization/organizations/<org_id>/memberships/
//   POST   /api/v1/organization/organizations/<org_id>/memberships/
//   GET    /api/v1/organization/memberships/<id>/
//   PATCH  /api/v1/organization/memberships/<id>/status/
//   GET    /api/v1/organization/memberships/<id>/unit-memberships/
//   GET    /api/v1/organization/memberships/<id>/position-assignments/
//   GET    /api/v1/auth/users/?search=   (UserPicker only)
import type { QueryParams } from "@peppermint/admin";
import type { UserPickerOption } from "../_shared/UserPicker/UserPicker.types";
import type {
  ChangeMembershipStatusPayload,
  CreatePersonPayload,
  Person,
  PeopleFetchResponse,
  PositionAssignmentSummary,
  UnitMembershipSummary,
  UserSearchResult,
} from "./people.types";

const ORG_MOH = "11111111-1111-4111-8111-111111111111";
const ORG_NPA = "22222222-2222-4222-8222-222222222222";

const MOCK_USERS: UserSearchResult[] = [
  {
    id: "a1000001-0001-4001-8001-000000000001",
    display_name: "Dr. Sarah Nakato",
    email: "s.nakato@moh.go.ug",
  },
  {
    id: "a1000002-0002-4002-8002-000000000002",
    display_name: "James Okello",
    email: "j.okello@moh.go.ug",
  },
  {
    id: "a1000003-0003-4003-8003-000000000003",
    display_name: "Grace Auma",
    email: "g.auma@npa.go.ug",
  },
  {
    id: "a1000004-0004-4004-8004-000000000004",
    display_name: "Peter Mugisha",
    email: "p.mugisha@npa.go.ug",
  },
  {
    id: "a1000005-0005-4005-8005-000000000005",
    display_name: "Rebecca Namuli",
    email: "r.namuli@moh.go.ug",
  },
];

let MOCK_PEOPLE: Person[] = [
  {
    id: "m1000001-0001-4001-8001-000000000001",
    organization: ORG_MOH,
    user_id: "a1000001-0001-4001-8001-000000000001",
    user_display_name: "Dr. Sarah Nakato",
    user_email: "s.nakato@moh.go.ug",
    employee_code: "MOH-001",
    membership_status: "active",
    joined_at: "2024-03-15T09:00:00Z",
    ended_at: null,
    is_primary: true,
    created_at: "2024-03-15T09:00:00Z",
    updated_at: "2026-05-01T10:00:00Z",
  },
  {
    id: "m1000002-0002-4002-8002-000000000002",
    organization: ORG_MOH,
    user_id: "a1000002-0002-4002-8002-000000000002",
    user_display_name: "James Okello",
    user_email: "j.okello@moh.go.ug",
    employee_code: "MOH-042",
    membership_status: "active",
    joined_at: "2025-01-10T09:00:00Z",
    ended_at: null,
    is_primary: true,
    created_at: "2025-01-10T09:00:00Z",
    updated_at: "2025-01-10T09:00:00Z",
  },
  {
    id: "m1000003-0003-4003-8003-000000000003",
    organization: ORG_MOH,
    user_id: "a1000005-0005-4005-8005-000000000005",
    user_display_name: "Rebecca Namuli",
    user_email: "r.namuli@moh.go.ug",
    employee_code: "MOH-108",
    membership_status: "invited",
    joined_at: null,
    ended_at: null,
    is_primary: false,
    created_at: "2026-06-20T09:00:00Z",
    updated_at: "2026-06-20T09:00:00Z",
  },
  {
    id: "m1000004-0004-4004-8004-000000000004",
    organization: ORG_NPA,
    user_id: "a1000003-0003-4003-8003-000000000003",
    user_display_name: "Grace Auma",
    user_email: "g.auma@npa.go.ug",
    employee_code: "NPA-007",
    membership_status: "active",
    joined_at: "2023-08-01T09:00:00Z",
    ended_at: null,
    is_primary: true,
    created_at: "2023-08-01T09:00:00Z",
    updated_at: "2026-04-15T08:00:00Z",
  },
  {
    id: "m1000005-0005-4005-8005-000000000005",
    organization: ORG_NPA,
    user_id: "a1000004-0004-4004-8004-000000000004",
    user_display_name: "Peter Mugisha",
    user_email: "p.mugisha@npa.go.ug",
    employee_code: "NPA-019",
    membership_status: "suspended",
    joined_at: "2024-11-20T09:00:00Z",
    ended_at: null,
    is_primary: true,
    created_at: "2024-11-20T09:00:00Z",
    updated_at: "2026-06-01T14:00:00Z",
  },
  {
    id: "m1000006-0006-4006-8006-000000000006",
    organization: ORG_MOH,
    user_id: "a1000003-0003-4003-8003-000000000003",
    user_display_name: "Grace Auma",
    user_email: "g.auma@npa.go.ug",
    employee_code: "MOH-SEC-02",
    membership_status: "ended",
    joined_at: "2022-06-01T09:00:00Z",
    ended_at: "2025-12-31T17:00:00Z",
    is_primary: false,
    created_at: "2022-06-01T09:00:00Z",
    updated_at: "2025-12-31T17:00:00Z",
  },
];

const MOCK_UNIT_MEMBERSHIPS: Record<string, UnitMembershipSummary[]> = {
  "m1000001-0001-4001-8001-000000000001": [
    {
      id: "um100001-0001-4001-8001-000000000001",
      unit_id: "u1000001-0001-4001-8001-000000000001",
      unit_name: "Health Directorate",
      unit_code: "health-directorate",
      membership_type: "permanent",
      status: "active",
      is_primary: true,
      valid_from: "2024-03-15T09:00:00Z",
      valid_to: null,
    },
  ],
  "m1000002-0002-4002-8002-000000000002": [
    {
      id: "um100002-0002-4002-8002-000000000002",
      unit_id: "u1000002-0002-4002-8002-000000000002",
      unit_name: "Procurement Section",
      unit_code: "procurement",
      membership_type: "permanent",
      status: "active",
      is_primary: true,
      valid_from: "2025-01-10T09:00:00Z",
      valid_to: null,
    },
  ],
  "m1000004-0004-4004-8004-000000000004": [
    {
      id: "um100004-0004-4004-8004-000000000004",
      unit_id: "u1000004-0004-4004-8004-000000000004",
      unit_name: "Planning Division",
      unit_code: "planning",
      membership_type: "permanent",
      status: "active",
      is_primary: true,
      valid_from: "2023-08-01T09:00:00Z",
      valid_to: null,
    },
  ],
};

const MOCK_POSITION_ASSIGNMENTS: Record<string, PositionAssignmentSummary[]> = {
  "m1000001-0001-4001-8001-000000000001": [
    {
      id: "pa100001-0001-4001-8001-000000000001",
      position_id: "p1000001-0001-4001-8001-000000000001",
      position_title: "Director of Health",
      position_code: "dir-health",
      assignment_type: "primary",
      status: "active",
      is_primary: true,
      starts_at: "2024-03-15T09:00:00Z",
      ends_at: null,
    },
  ],
  "m1000002-0002-4002-8002-000000000002": [
    {
      id: "pa100002-0002-4002-8002-000000000002",
      position_id: "p1000002-0002-4002-8002-000000000002",
      position_title: "Procurement Officer",
      position_code: "proc-officer",
      assignment_type: "primary",
      status: "active",
      is_primary: true,
      starts_at: "2025-01-10T09:00:00Z",
      ends_at: null,
    },
  ],
  "m1000004-0004-4004-8004-000000000004": [
    {
      id: "pa100004-0004-4004-8004-000000000004",
      position_id: "p1000004-0004-4004-8004-000000000004",
      position_title: "Senior Planner",
      position_code: "sr-planner",
      assignment_type: "primary",
      status: "active",
      is_primary: true,
      starts_at: "2023-08-01T09:00:00Z",
      ends_at: null,
    },
  ],
};

function delay(ms = 250) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export async function fetchPeople(
  orgId: string,
  params?: QueryParams,
): Promise<PeopleFetchResponse> {
  await delay();
  let data = MOCK_PEOPLE.filter((p) => p.organization === orgId);

  const statusFilter = params?.filters?.membership_status as string | undefined;
  if (statusFilter) {
    data = data.filter((p) => p.membership_status === statusFilter);
  }

  if (params?.search) {
    const q = params.search.toLowerCase();
    data = data.filter(
      (p) =>
        p.user_display_name.toLowerCase().includes(q) ||
        p.user_email.toLowerCase().includes(q) ||
        p.employee_code.toLowerCase().includes(q),
    );
  }

  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  return {
    data: paginate(data, page, pageSize),
    meta: { total: data.length, page, pageSize },
  };
}

export async function createPerson(
  orgId: string,
  values: CreatePersonPayload,
): Promise<Person> {
  await delay(300);
  const user = MOCK_USERS.find((u) => u.id === values.user_id);
  const now = new Date().toISOString();
  const person: Person = {
    id: crypto.randomUUID(),
    organization: orgId,
    user_id: values.user_id,
    user_display_name: user?.display_name ?? "Unknown User",
    user_email: user?.email ?? "",
    employee_code: values.employee_code,
    membership_status: "invited",
    joined_at: values.joined_at,
    ended_at: null,
    is_primary: values.is_primary,
    created_at: now,
    updated_at: now,
  };
  MOCK_PEOPLE = [...MOCK_PEOPLE, person];
  return person;
}

export async function fetchPerson(id: string): Promise<Person> {
  await delay(200);
  const person = MOCK_PEOPLE.find((p) => p.id === id);
  if (!person) {
    throw new Error("ORGANIZATION_MEMBERSHIP_NOT_FOUND");
  }
  return person;
}

export async function fetchUnitMemberships(
  membershipId: string,
): Promise<UnitMembershipSummary[]> {
  await delay(200);
  return MOCK_UNIT_MEMBERSHIPS[membershipId] ?? [];
}

export async function fetchPositionAssignments(
  membershipId: string,
): Promise<PositionAssignmentSummary[]> {
  await delay(200);
  return MOCK_POSITION_ASSIGNMENTS[membershipId] ?? [];
}

export async function changeMembershipStatus(
  id: string,
  payload: ChangeMembershipStatusPayload,
): Promise<Person> {
  await delay(300);
  const index = MOCK_PEOPLE.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error("ORGANIZATION_MEMBERSHIP_NOT_FOUND");
  }
  const existing = MOCK_PEOPLE[index];
  const updated: Person = {
    ...existing,
    membership_status: payload.status,
    ended_at:
      payload.status === "ended"
        ? (existing.ended_at ?? new Date().toISOString())
        : existing.ended_at,
    updated_at: new Date().toISOString(),
  };
  MOCK_PEOPLE = [
    ...MOCK_PEOPLE.slice(0, index),
    updated,
    ...MOCK_PEOPLE.slice(index + 1),
  ];
  return updated;
}

export async function searchUsers(search: string): Promise<UserPickerOption[]> {
  await delay(150);
  const q = search.toLowerCase();
  return MOCK_USERS.filter(
    (u) =>
      u.display_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q),
  ).map((u) => ({
    id: u.id,
    fullName: u.display_name,
    email: u.email,
  }));
}
