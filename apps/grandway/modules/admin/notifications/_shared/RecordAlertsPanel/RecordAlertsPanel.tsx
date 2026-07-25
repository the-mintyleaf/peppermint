"use client";

import { Loader, Stack, Text } from "@peppermint/ui";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useNotificationsForEntities } from "../../notifications.hooks";
import { NotificationRow } from "../NotificationRow";
import type { RecordAlertsPanelProps } from "./RecordAlertsPanel.types";

/**
 * Embeddable "your alerts for this record" panel — modeled on
 * `audit/_shared/useEntityAuditTrail`'s "scoped list embedded in another
 * screen" shape. Deliberately omits `status` (§3, FLOWS.md "Review the alert
 * history for one record") so it shows the full history for the record,
 * active AND resolved/dismissed — the point of this panel is the history, not
 * just the working inbox.
 *
 * **Titled "Your alerts for this record", never "All alerts"** — this only
 * returns alerts addressed to the CALLING user. Alerts about the same record
 * sent to other staff are invisible here; a complete cross-user history is
 * `audit`, not this module (FLOWS.md).
 *
 * `sourceEntityId` accepts one id or several — see its own doc comment. A
 * single-element (or empty) array is the common case; multiple ids merge
 * into one deduplicated, newest-first list via `useNotificationsForEntities`.
 *
 * States: loading → `Loader`; request-failed → `QueryErrorState` + retry;
 * empty → "No alerts for this record." (also the honest state when no id was
 * available to query at all — e.g. an applicant with no passport on file);
 * each row already renders its own "archived" state (`status !== "active"`
 * hides Dismiss). Permission-denied and read-only mode are N/A here — this
 * panel is embedded inside an already-guarded host screen (applicant/offer/
 * journey/checklist detail), which owns its own access gate; conflicting
 * edits (409 on dismiss) surface via that row's own mutation error toast.
 */
export function RecordAlertsPanel({ sourceEntityId }: RecordAlertsPanelProps) {
  const entityIds = Array.isArray(sourceEntityId)
    ? sourceEntityId
    : [sourceEntityId];
  const { notifications, isLoading, isError, isRefetching, refetch } =
    useNotificationsForEntities(entityIds);

  return (
    <Stack gap="sm">
      <Text size="sm" fw={500}>
        Your alerts for this record
      </Text>

      {isLoading ? <Loader size="sm" /> : null}

      {isError ? (
        <QueryErrorState
          message="Couldn't load alerts for this record."
          onRetry={() => refetch()}
          isRetrying={isRefetching}
        />
      ) : null}

      {!isLoading && !isError && notifications.length === 0 ? (
        <Text size="xs" c="dimmed">
          No alerts for this record.
        </Text>
      ) : null}

      {!isLoading && !isError && notifications.length > 0 ? (
        <Stack gap="xs">
          {notifications.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
            />
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}
