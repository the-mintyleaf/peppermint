"use client";

import { ActionIcon, Badge, Text, dayjs } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import type { AuditEvent } from "@/modules/admin/audit/_shared/audit.types";

interface AuditEventsColumnsOptions {
  onViewDetails: (event: AuditEvent) => void;
}

/** Sentence-case an `app.model.action`-shaped or `snake_case` value for display only. */
function humanize(value: string): string {
  if (!value) return "";
  return value.replace(/_/g, " ");
}

export function getAuditEventsColumns({
  onViewDetails,
}: AuditEventsColumnsOptions): DataTableShellColumn<AuditEvent>[] {
  return [
    {
      accessor: "created_at",
      title: "When",
      render: (event: AuditEvent) => {
        const d = dayjs(event.created_at);
        return d.isValid() ? (
          <Text size="xs">{d.format("MMM D, YYYY h:mm A")}</Text>
        ) : (
          <Text size="xs" c="dimmed">
            —
          </Text>
        );
      },
    },
    {
      accessor: "actor_label",
      title: "Actor",
      filter: { type: "text", placeholder: "Actor UUID" },
      render: (event: AuditEvent) => (
        <Text size="xs" c={event.actor_label ? undefined : "dimmed"}>
          {event.actor_label || `(${event.actor_type})`}
        </Text>
      ),
    },
    {
      accessor: "actor_type",
      title: "Authority",
      filter: {
        type: "select",
        options: [
          { label: "Superadmin", value: "superadmin" },
          { label: "Admin", value: "admin" },
          { label: "Lead Manager", value: "lead_manager" },
          { label: "System", value: "system" },
          { label: "AI", value: "ai" },
        ],
      },
      render: (event: AuditEvent) => (
        <Text size="xs">{humanize(event.actor_type)}</Text>
      ),
    },
    {
      accessor: "app_label",
      title: "App",
      filter: { type: "text", placeholder: "e.g. authenticate" },
      render: (event: AuditEvent) => <Text size="xs">{event.app_label}</Text>,
    },
    {
      accessor: "action",
      title: "Action",
      filter: { type: "text", placeholder: "e.g. account_blocked" },
      render: (event: AuditEvent) => (
        <Text size="xs">{humanize(event.action)}</Text>
      ),
    },
    {
      accessor: "entity_type",
      title: "Entity",
      filter: { type: "text", placeholder: "e.g. authenticate.user" },
      render: (event: AuditEvent) => (
        <Text size="xs" c={event.entity_type ? undefined : "dimmed"}>
          {event.entity_type || "—"}
        </Text>
      ),
    },
    {
      accessor: "success",
      title: "Outcome",
      filter: {
        type: "select",
        options: [
          { label: "Success", value: "true" },
          { label: "Failed", value: "false" },
        ],
      },
      render: (event: AuditEvent) => (
        <Badge size="xs" variant="light" color={event.success ? "teal" : "red"}>
          {event.success ? "Success" : "Failed"}
        </Badge>
      ),
    },
    {
      accessor: "actions",
      title: "",
      textAlign: "right",
      render: (event: AuditEvent) => (
        <ActionIcon
          variant="subtle"
          size="sm"
          aria-label={`View event ${event.id}`}
          onClick={() => onViewDetails(event)}
        >
          <EyeIcon size={16} aria-hidden />
        </ActionIcon>
      ),
    },
  ];
}
