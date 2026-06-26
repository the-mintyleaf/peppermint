// VERTICAL-SLICE: mock API — replaced in Phase 4 with real Axios calls
// REQUIRED (Phase 4): add to backend URL table before Phase 4 starts:
//   GET /api/v1/organization/units/tree/?organization={id}&depth={n}
//   POST /api/v1/organization/units/
//   POST /api/v1/organization/positions/

export interface CreateUnitInput {
  organization: string;
  name: string;
  code?: string;
  unitType?: string;
  parentUnit?: string | null;
}

export interface CreatePositionInput {
  organization: string;
  unit: string;
  title: string;
  code?: string;
  positionType?: string;
}

export async function fetchUnitTree(
  orgId: string,
  opts?: { depth?: number; asOf?: string },
): Promise<{ units: unknown[]; positions: unknown[] }> {
  void orgId;
  void opts;
  await new Promise((r) => setTimeout(r, 200));
  return { units: [], positions: [] };
}

export async function createUnit(
  data: CreateUnitInput,
): Promise<{ id: string }> {
  await new Promise((r) => setTimeout(r, 300));
  return { id: `unit-${Date.now()}` };
}

export async function createPosition(
  data: CreatePositionInput,
): Promise<{ id: string }> {
  await new Promise((r) => setTimeout(r, 300));
  return { id: `pos-${Date.now()}` };
}
