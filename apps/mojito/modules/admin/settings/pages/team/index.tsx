"use client";

import { ModalTableShell } from "@peppermint/admin";
import { Paper } from "@peppermint/ui";
import {
  fetchTeamPaginated,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "../../team.api";
import { teamColumns } from "./team.columns";
import { teamQueryKeys } from "../../team.queryKeys";
import { TeamMemberForm } from "../../form/TeamMemberForm";
import type { TeamMemberRow } from "../../team.types";

const BASE_PATH = "/admin/settings/team";

const MODULE_INFO = {
  name: "team",
  label: "Team & Roles",
  description: "Manage who has access to your workspace",
};

export function TeamList() {
  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
      <ModalTableShell<TeamMemberRow>
        queryKey={teamQueryKeys.list()}
        queryGetFn={fetchTeamPaginated}
        dataKey="data"
        paginationKey="meta"
        columns={teamColumns}
        moduleInfo={MODULE_INFO}
        idAccessor="id"
        createFormComponent={TeamMemberForm}
        editFormComponent={TeamMemberForm}
        createModalTitle="Invite Team Member"
        editModalTitle="Update Role"
        onCreateApi={(values) => createTeamMember(values as Partial<TeamMemberRow>)}
        onEditApi={(values) =>
          updateTeamMember((values as TeamMemberRow).id, values as Partial<TeamMemberRow>)
        }
        onDeleteApi={(id) => deleteTeamMember(String(id))}
        pageSizes={[10, 20, 50]}
        defaultPageSize={20}
        basePath={BASE_PATH}
      />
    </Paper>
  );
}
