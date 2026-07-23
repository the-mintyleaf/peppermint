import { useQuery } from "@peppermint/ui";
import { fetchAuditEvents } from "./audit.api";
import { auditQueryKeys } from "./auditQueryKeys";

/**
 * A single entity's audit trail — `GET /audit/events/?entity_type=&entity_id=`
 * (`audit/docs/INTEGRATION.md` §7, "Reconstruct a record's history"). Results are
 * newest-first, capped at 100 (the endpoint's max `page_size`); a fuller chronological
 * timeline for a busier record would need to page through — not needed by any
 * consumer yet. Exported so any future app can reuse this filter shape instead of
 * re-deriving it.
 */
export function useEntityAuditTrail(entityType: string, entityId: string) {
  return useQuery({
    queryKey: auditQueryKeys.list({
      entity_type: entityType,
      entity_id: entityId,
    }),
    queryFn: () =>
      fetchAuditEvents({
        page: 1,
        pageSize: 100,
        search: "",
        sort: [],
        filters: { entity_type: entityType, entity_id: entityId },
      }),
    enabled: Boolean(entityType && entityId),
  });
}
