import type {
  Organization,
  OrganizationMembership,
  OrganizationUnit,
  UnitType,
} from "../_shared/organization.types";

/**
 * A clearly-fake organization id. Real orgs are UUIDs, so this never collides with
 * a real org in the shared React Query cache — the test-tree's queries stay isolated
 * from the real builder's, even though both use `["organizations", orgId, ...]` keys.
 */
export const TEST_ORG_ID = "test-tree-org";

/**
 * A random id that also works in an insecure browser context — `crypto.randomUUID`
 * is undefined when the app is served over plain http on a LAN IP (not
 * `localhost`/https), which would otherwise crash the playground on hydration.
 */
export function genId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    try {
      return crypto.randomUUID();
    } catch {
      // fall through to the non-crypto fallback below
    }
  }
  return `id-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

/** A person the test-tree can place into units. Names back the member nodes. */
export interface SeedPerson {
  userId: string;
  employeeCode: string;
  displayName: string;
  username: string;
}

/** A direct unit membership (a person placed in a unit without a position). */
export interface SeedUnitMember {
  id: string;
  membershipId: string;
  unitId: string;
  userId: string;
  displayName: string;
  username: string;
  membershipType: string;
  isPrimary: boolean;
}

export interface Seed {
  org: Organization;
  units: OrganizationUnit[];
  memberships: OrganizationMembership[];
  people: Record<string, SeedPerson>;
  unitMembers: SeedUnitMember[];
}

interface UnitSpec {
  code: string;
  name_np: string;
  name_en: string;
  unit_type: UnitType;
  parentCode: string | null;
  status?: OrganizationUnit["status"];
}

const UNIT_SPECS: UnitSpec[] = [
  // Roots
  {
    code: "ADMIN",
    name_np: "प्रशासन महाशाखा",
    name_en: "Administration Division",
    unit_type: "division",
    parentCode: null,
    status: "active",
  },
  {
    code: "FIN",
    name_np: "वित्त महाशाखा",
    name_en: "Finance Division",
    unit_type: "division",
    parentCode: null,
    status: "active",
  },
  {
    code: "PLAN",
    name_np: "योजना महाशाखा",
    name_en: "Planning Division",
    unit_type: "division",
    parentCode: null,
    status: "active",
  },
  // Under ADMIN
  {
    code: "HR",
    name_np: "मानव संसाधन शाखा",
    name_en: "Human Resources Section",
    unit_type: "section",
    parentCode: "ADMIN",
    status: "active",
  },
  {
    code: "IT",
    name_np: "सूचना प्रविधि शाखा",
    name_en: "Information Technology Section",
    unit_type: "section",
    parentCode: "ADMIN",
    status: "active",
  },
  {
    code: "RECRUIT",
    name_np: "भर्ना इकाई",
    name_en: "Recruitment Unit",
    unit_type: "cell",
    parentCode: "HR",
    status: "draft",
  },
  // Under FIN
  {
    code: "ACCT",
    name_np: "लेखा शाखा",
    name_en: "Accounts Section",
    unit_type: "section",
    parentCode: "FIN",
    status: "active",
  },
  {
    code: "BUDGET",
    name_np: "बजेट शाखा",
    name_en: "Budget Section",
    unit_type: "section",
    parentCode: "FIN",
    status: "active",
  },
  // Under PLAN
  {
    code: "MON",
    name_np: "अनुगमन तथा मूल्यांकन शाखा",
    name_en: "Monitoring & Evaluation Section",
    unit_type: "section",
    parentCode: "PLAN",
    status: "active",
  },
];

const PEOPLE_SPECS: Omit<SeedPerson, "userId">[] = [
  {
    employeeCode: "EMP-1001",
    displayName: "सीता श्रेष्ठ (Sita Shrestha)",
    username: "sita.shrestha",
  },
  {
    employeeCode: "EMP-1002",
    displayName: "राम बहादुर थापा (Ram Bahadur Thapa)",
    username: "ram.thapa",
  },
  {
    employeeCode: "EMP-1003",
    displayName: "अनु महर्जन (Anu Maharjan)",
    username: "anu.maharjan",
  },
  {
    employeeCode: "EMP-1004",
    displayName: "हरि प्रसाद पौडेल (Hari Prasad Paudel)",
    username: "hari.paudel",
  },
  {
    employeeCode: "EMP-1005",
    displayName: "गीता कार्की (Gita Karki)",
    username: "gita.karki",
  },
];

/** Direct members to pre-place: (unitCode, employeeCode, isPrimary). */
const UNIT_MEMBER_SPECS: Array<{
  unitCode: string;
  employeeCode: string;
  isPrimary: boolean;
  membershipType: string;
}> = [
  {
    unitCode: "HR",
    employeeCode: "EMP-1001",
    isPrimary: true,
    membershipType: "staff",
  },
  {
    unitCode: "ACCT",
    employeeCode: "EMP-1002",
    isPrimary: true,
    membershipType: "staff",
  },
  {
    unitCode: "ACCT",
    employeeCode: "EMP-1004",
    isPrimary: false,
    membershipType: "staff",
  },
];

/** A fresh, fully-linked seed. Called on mount and on every Reset. */
export function buildSeed(): Seed {
  const now = new Date().toISOString();

  const org: Organization = {
    id: TEST_ORG_ID,
    name_np: "अर्थ मन्त्रालय",
    name_en: "Ministry of Finance",
    name_romanized: "artha mantralaya",
    code: "MOF",
    organization_type: "ministry",
    status: "active",
    parent_organization: null,
    legal_name_np: "अर्थ मन्त्रालय, नेपाल सरकार",
    short_name_np: "अर्थ",
    short_name_en: "MOF",
    description: "Test-tree playground organization — no backend.",
    country_code: "NP",
    timezone: "Asia/Kathmandu",
    sort_order: 0,
    metadata: {},
    is_active: true,
    created_at: now,
    updated_at: now,
  };

  // Resolve codes → uuids, then compute depth + path_cache off the parent chain.
  const idByCode = new Map<string, string>();
  for (const spec of UNIT_SPECS) idByCode.set(spec.code, genId());
  const specByCode = new Map(UNIT_SPECS.map((s) => [s.code, s]));

  function depthOf(code: string): number {
    let depth = 0;
    let cur = specByCode.get(code);
    while (cur?.parentCode) {
      depth += 1;
      cur = specByCode.get(cur.parentCode);
    }
    return depth;
  }
  function pathOf(code: string): string {
    const chain: string[] = [];
    let cur: UnitSpec | undefined = specByCode.get(code);
    while (cur) {
      chain.unshift(cur.code);
      cur = cur.parentCode ? specByCode.get(cur.parentCode) : undefined;
    }
    return `/${chain.join("/")}`;
  }

  const units: OrganizationUnit[] = UNIT_SPECS.map((spec, index) => ({
    id: idByCode.get(spec.code)!,
    organization: TEST_ORG_ID,
    parent: spec.parentCode ? idByCode.get(spec.parentCode)! : null,
    name_np: spec.name_np,
    name_en: spec.name_en,
    name_romanized: spec.code.toLowerCase(),
    code: spec.code,
    unit_type: spec.unit_type,
    status: spec.status ?? "active",
    description: "",
    sort_order: index,
    depth: depthOf(spec.code),
    path_cache: pathOf(spec.code),
    is_operational: true,
    is_active: (spec.status ?? "active") === "active",
    effective_from: now,
    effective_to: null,
    metadata: {},
    created_at: now,
    updated_at: now,
  }));

  const people: Record<string, SeedPerson> = {};
  const memberships: OrganizationMembership[] = PEOPLE_SPECS.map((spec) => {
    const userId = genId();
    const membershipId = genId();
    people[userId] = { userId, ...spec };
    return {
      id: membershipId,
      organization: TEST_ORG_ID,
      user: userId,
      employee_code: spec.employeeCode,
      membership_status: "active",
      joined_at: now,
      ended_at: null,
      is_primary: true,
      metadata: {},
      created_at: now,
      updated_at: now,
    };
  });

  const membershipByEmpCode = new Map(
    memberships.map((m) => [m.employee_code, m]),
  );
  const personByUserId = people;

  const unitMembers: SeedUnitMember[] = UNIT_MEMBER_SPECS.map((spec) => {
    const membership = membershipByEmpCode.get(spec.employeeCode)!;
    const person = personByUserId[membership.user];
    return {
      id: genId(),
      membershipId: membership.id,
      unitId: idByCode.get(spec.unitCode)!,
      userId: membership.user,
      displayName: person.displayName,
      username: person.username,
      membershipType: spec.membershipType,
      isPrimary: spec.isPrimary,
    };
  });

  return { org, units, memberships, people, unitMembers };
}
