"use client";

import { useState } from "react";
import { ModalTableShell } from "@peppermint/admin";
import { Button, Group, ModalPaper, Switch } from "@peppermint/ui";
import { SlidersIcon } from "@phosphor-icons/react/dist/csr/Sliders";
import { RequireLeadAccess } from "@/components/RequireLeadAccess";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import {
  createProgram,
  fetchPrograms,
  updateProgram,
} from "../../../institutions.api";
import {
  useCountries,
  useFields,
  useInstitutions,
} from "../../../institutions.hooks";
import { programQueryKeys } from "../../../institutions.queryKeys";
import type { Program, ProgramFormValues } from "../../../institutions.types";
import { ProgramForm } from "../../form/ProgramForm";
import {
  toProgramCreatePayload,
  toProgramUpdatePayload,
} from "../../form/programForm.utils";
import { InstitutionsReferenceModal } from "../../../reference-data";
import { ProgramDetailDrawer } from "./components/ProgramDetailDrawer";
import { getProgramsColumns } from "./programs.columns";

function ProgramSearchContent() {
  const { authorityType } = useCurrentUser();
  const canManage = authorityType === "admin";
  const [usableOnly, setUsableOnly] = useState(true);
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [detailProgramId, setDetailProgramId] = useState<string | null>(null);

  const { data: countries = [] } = useCountries();
  const { data: institutions = [] } = useInstitutions();
  const { data: fields = [] } = useFields();

  const columns = getProgramsColumns({
    countries,
    institutions,
    fields,
    canManage,
    onView: (program) => setDetailProgramId(program.id),
  });

  return (
    <>
      <ModalTableShell<Program, ProgramFormValues, ProgramFormValues>
        queryKey={[...programQueryKeys.lists(), usableOnly ? "usable" : "all"]}
        queryGetFn={fetchPrograms}
        enableServerQuery
        dataKey="data"
        paginationKey="meta"
        idAccessor="id"
        columns={columns}
        moduleInfo={{
          name: "program",
          label: "Programs",
          description: "Search the study-opportunity catalogue",
        }}
        createModalTitle="Add program"
        editModalTitle="Edit program"
        modalWidth={720}
        createFormComponent={canManage ? ProgramForm : undefined}
        editFormComponent={canManage ? ProgramForm : undefined}
        onCreateApi={(values) => createProgram(toProgramCreatePayload(values))}
        onEditApi={(values, record) =>
          updateProgram(record.id, toProgramUpdatePayload(values))
        }
        disableReviewButton
        getErrorMessage={getApiErrorMessage}
        forceFilters={{ usable_only: usableOnly }}
        pageSizes={[10, 20, 30, 50]}
        defaultPageSize={20}
        basePath="/admin/institutions"
        mainComponent={ModalPaper}
        mainComponentProps={{ withBorder: true }}
        headerRight={
          <Group gap="xs" align="center">
            <Switch
              size="xs"
              label="Offerable only"
              checked={usableOnly}
              onChange={(e) => setUsableOnly(e.currentTarget.checked)}
            />
            {canManage ? (
              <Button
                size="xs"
                variant="default"
                leftSection={<SlidersIcon size={14} aria-hidden />}
                onClick={() => setReferenceOpen(true)}
              >
                Countries & fields
              </Button>
            ) : null}
          </Group>
        }
      />

      <ProgramDetailDrawer
        programId={detailProgramId}
        opened={detailProgramId !== null}
        onClose={() => setDetailProgramId(null)}
      />

      {canManage ? (
        <InstitutionsReferenceModal
          opened={referenceOpen}
          onClose={() => setReferenceOpen(false)}
        />
      ) : null}
    </>
  );
}

export function ProgramSearch() {
  return (
    <RequireLeadAccess>
      <ProgramSearchContent />
    </RequireLeadAccess>
  );
}
