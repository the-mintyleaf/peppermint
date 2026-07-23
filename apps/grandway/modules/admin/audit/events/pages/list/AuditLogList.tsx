"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DataTableShell } from "@peppermint/admin";
import { ModalPaper } from "@peppermint/ui";
import { RequireStaff } from "@/components/RequireStaff";
import { fetchAuditEvents } from "@/modules/admin/audit/_shared/audit.api";
import { auditQueryKeys } from "@/modules/admin/audit/_shared/auditQueryKeys";
import type { AuditEvent } from "@/modules/admin/audit/_shared/audit.types";
import { EventDetailDrawer } from "./components/EventDetailDrawer";
import { getAuditEventsColumns } from "./auditEvents.columns";

/**
 * Central audit log (`GET /api/v1/audit/events/`, admin/superadmin only —
 * `audit/docs/INTEGRATION.md` §1). The endpoint has no free-text search — column
 * filters cover the exact-match params the API actually supports (§3). The shell's
 * search box has no way to be hidden from here; `audit.api.ts` deliberately never
 * forwards it, so typing there has no effect rather than silently mis-filtering.
 */
function AuditLogListContent() {
  const searchParams = useSearchParams();
  const [detailEvent, setDetailEvent] = useState<AuditEvent | null>(null);

  const actorId = searchParams.get("actor_id") ?? undefined;
  const entityType = searchParams.get("entity_type") ?? undefined;
  const entityId = searchParams.get("entity_id") ?? undefined;

  const forceFilters = useMemo(() => {
    const filters: Record<string, string> = {};
    if (actorId) filters.actor_id = actorId;
    if (entityType) filters.entity_type = entityType;
    if (entityId) filters.entity_id = entityId;
    return Object.keys(filters).length > 0 ? filters : undefined;
  }, [actorId, entityType, entityId]);

  const columns = getAuditEventsColumns({ onViewDetails: setDetailEvent });

  return (
    <>
      <DataTableShell<AuditEvent>
        queryKey={auditQueryKeys.lists()}
        queryGetFn={fetchAuditEvents}
        enableServerQuery
        dataKey="data"
        paginationKey="meta"
        idAccessor="id"
        columns={columns}
        moduleInfo={{
          name: "audit-event",
          label: "Audit Log",
          description: "Central, immutable, cross-app activity history",
        }}
        forceFilters={forceFilters}
        disableActions
        disableCreateButton
        pageSizes={[10, 20, 30, 50]}
        defaultPageSize={20}
        basePath="/admin/audit"
        mainComponent={ModalPaper}
        mainComponentProps={{ withBorder: true }}
      />

      <EventDetailDrawer
        event={detailEvent}
        opened={detailEvent !== null}
        onClose={() => setDetailEvent(null)}
      />
    </>
  );
}

export function AuditLogList() {
  return (
    <RequireStaff>
      <AuditLogListContent />
    </RequireStaff>
  );
}
