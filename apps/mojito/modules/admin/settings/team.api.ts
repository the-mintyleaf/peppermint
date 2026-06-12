import type { QueryParams } from "@zetsel/admin";
import { delay, paginate } from "../shared/mock.utils";
import {
  fetchTeamMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  type TeamMember,
} from "./settings.api";
import type { TeamMemberRow, TeamFetchResponse } from "./team.types";

export async function fetchTeamPaginated(params?: QueryParams): Promise<TeamFetchResponse> {
  await delay();
  let items = (await fetchTeamMembers()) as TeamMemberRow[];

  if (params?.search) {
    const q = params.search.toLowerCase();
    items = items.filter(
      (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
    );
  }

  return paginate(items, params?.page ?? 1, params?.pageSize ?? 20);
}

export async function createTeamMember(values: Partial<TeamMemberRow>): Promise<TeamMemberRow> {
  const email = values.email ?? "";
  const role = (values.role ?? "editor") as TeamMember["role"];
  return inviteMember(email, role) as TeamMemberRow;
}

export async function updateTeamMember(
  id: string,
  values: Partial<TeamMemberRow>,
): Promise<TeamMemberRow> {
  const role = values.role as TeamMember["role"];
  return updateMemberRole(id, role) as TeamMemberRow;
}

export async function deleteTeamMember(id: string): Promise<void> {
  return removeMember(id);
}
