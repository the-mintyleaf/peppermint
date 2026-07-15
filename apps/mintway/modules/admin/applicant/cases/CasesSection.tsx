"use client";

import { useRouter } from "next/navigation";
import { ModalPaper } from "@peppermint/ui";
import { ModalTableShell } from "@peppermint/admin";

import { getApiErrorMessage } from "@/lib/authErrorMessages";
import type { ApplicationCase } from "../_shared";
import { CaseForm } from "./CaseForm";
import { createCase, fetchCases } from "./cases.api";
import type { CaseCreatePayload } from "./cases.api";
import { getCaseColumns } from "./cases.columns";

/**
 * The applicant's application cases (§10.1): list + open. A case's status, updates, and
 * history live on its own detail page (`/admin/application-cases/:id`) — the row arrow
 * navigates there.
 */
export function CasesSection({ applicantId }: { applicantId: string }) {
  const router = useRouter();
  const columns = getCaseColumns((c) =>
    router.push(`/admin/application-cases/${c.id}`),
  );

  return (
    <ModalPaper withBorder>
      <ModalTableShell<ApplicationCase, CaseCreatePayload>
        queryKey={["applicant.cases", "list", applicantId]}
        queryGetFn={(params) => fetchCases(applicantId, params)}
        enableServerQuery
        dataKey="data"
        paginationKey="meta"
        idAccessor="id"
        columns={columns}
        moduleInfo={{
          name: "case",
          label: "Cases",
          description: "Destination/institution/program pathways",
        }}
        createModalTitle="Open case"
        createFormComponent={CaseForm}
        onCreateApi={(values) => createCase(applicantId, values)}
        getErrorMessage={getApiErrorMessage}
        disableReviewButton
        pageSizes={[10, 20, 30, 50]}
        defaultPageSize={20}
      />
    </ModalPaper>
  );
}
