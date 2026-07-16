"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ModalPaper } from "@peppermint/ui";
import { ModalTableShell } from "@peppermint/admin";

import { RequireStaff } from "@/components/RequireStaff";
import { getApiErrorMessage } from "@/lib/authErrorMessages";

import { ChainOfCommandView } from "../../components/ChainOfCommandView";
import { ReportingLineForm } from "../../form";
import type { ReportingLineFormValues } from "../../form/ReportingLineForm.types";
import {
  createReportingLine,
  fetchReportingLines,
} from "../../reportingLines.api";
import type { CreateReportingLinePayload } from "../../reportingLines.api";
import { reportingLinesQueryKeys } from "../../reportingLines.queryKeys";
import type { ReportingLine } from "../../reportingLines.types";
import { getReportingLinesColumns } from "./reportingLines.columns";

function ReportingLinesListContent() {
  const { orgId = "" } = useParams<{ orgId: string }>();
  const [chainPositionId, setChainPositionId] = useState<string | null>(null);

  const columns = getReportingLinesColumns({
    onViewChain: (record) => setChainPositionId(record.source_position),
  });

  return (
    <>
      <ModalTableShell<ReportingLine, ReportingLineFormValues>
        queryKey={reportingLinesQueryKeys.list(orgId)}
        queryGetFn={(params) => fetchReportingLines(orgId, params)}
        dataKey="data"
        paginationKey="meta"
        columns={columns}
        moduleInfo={{
          name: "reporting-line",
          label: "Reporting Lines",
          description: "Position-to-position chain of command",
        }}
        idAccessor="id"
        createFormComponent={ReportingLineForm}
        onCreateApi={(values) =>
          createReportingLine(orgId, values as CreateReportingLinePayload)
        }
        getErrorMessage={getApiErrorMessage}
        disableReviewButton
        pageSizes={[10, 20, 30, 50]}
        defaultPageSize={20}
        basePath={`/admin/organization/${orgId}/reporting-lines`}
        mainComponent={ModalPaper}
      />
      <ChainOfCommandView
        positionId={chainPositionId}
        opened={Boolean(chainPositionId)}
        onClose={() => setChainPositionId(null)}
      />
    </>
  );
}

export function ReportingLinesList() {
  return (
    <RequireStaff>
      <ReportingLinesListContent />
    </RequireStaff>
  );
}
