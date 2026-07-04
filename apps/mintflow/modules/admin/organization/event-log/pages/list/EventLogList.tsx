"use client";

import { useParams } from "next/navigation";
import { ModalPaper, ModuleHeader } from "@peppermint/ui";
import { DataTableShell } from "@peppermint/admin";

import { RequireStaff } from "@/components/RequireStaff";

import { fetchEventLog } from "../../eventLog.api";
import { eventLogQueryKeys } from "../../eventLog.queryKeys";
import type { OrganizationEventLog } from "../../eventLog.types";
import { getEventLogColumns } from "./eventLog.columns";

function EventLogListContent() {
  const { orgId = "" } = useParams<{ orgId: string }>();
  const columns = getEventLogColumns();

  return (
    <>
      <ModuleHeader
        breadcrumbItems={[
          { label: "Organization", href: "/admin/organization" },
          { label: "Event Log", href: "#" },
        ]}
      />
      <ModalPaper withBorder>
        <DataTableShell<OrganizationEventLog>
          queryKey={eventLogQueryKeys.list(orgId)}
          queryGetFn={(params) => fetchEventLog(orgId, params)}
          dataKey="data"
          paginationKey="meta"
          columns={columns}
          moduleInfo={{
            name: "event",
            label: "Event Log",
            description:
              "Append-only feed of organization changes, newest first",
          }}
          idAccessor="id"
          disableActions
          pageSizes={[10, 20, 30, 50]}
          defaultPageSize={20}
        />
      </ModalPaper>
    </>
  );
}

export function EventLogList() {
  return (
    <RequireStaff>
      <EventLogListContent />
    </RequireStaff>
  );
}
