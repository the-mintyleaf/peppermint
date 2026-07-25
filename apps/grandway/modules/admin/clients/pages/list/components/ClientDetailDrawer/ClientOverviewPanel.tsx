"use client";

import {
  Anchor,
  Avatar,
  Badge,
  Divider,
  Group,
  Stack,
  Text,
  dayjs,
} from "@peppermint/ui";
import type { ClientDetail, ClientStatus } from "../../../../clients.types";

const STATUS_COLORS: Record<ClientStatus, string> = {
  active: "teal",
  inactive: "gray",
};
const STATUS_LABELS: Record<ClientStatus, string> = {
  active: "Active",
  inactive: "Retired",
};

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="md" align="flex-start">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="xs" ta="right" c={value ? undefined : "dimmed"}>
        {value || "—"}
      </Text>
    </Group>
  );
}

export function ClientOverviewPanel({ client }: { client: ClientDetail }) {
  return (
    <Stack gap="sm">
      <Group gap="sm" wrap="nowrap">
        {/* Plain external URL — Avatar renders an <img>, not next/image (§3/§9). */}
        <Avatar src={client.logo_url || undefined} size="md" radius="sm">
          {client.name.charAt(0).toUpperCase()}
        </Avatar>
        <Stack gap={2}>
          <Text size="sm" fw={600}>
            {client.name}
          </Text>
          {/* Status is words + color + position — a labelled badge, never color alone. */}
          <Badge size="xs" variant="light" color={STATUS_COLORS[client.status]}>
            {STATUS_LABELS[client.status]}
          </Badge>
        </Stack>
      </Group>

      <Divider label="Organization" labelPosition="left" />
      <Field label="Spokesperson" value={client.spokesperson_name} />
      <Field label="Designation" value={client.spokesperson_designation} />
      <Field label="Email" value={client.email} />
      <Group justify="space-between" wrap="nowrap" gap="md" align="flex-start">
        <Text size="xs" c="dimmed">
          Website
        </Text>
        {client.website ? (
          <Anchor
            href={client.website}
            target="_blank"
            rel="noopener noreferrer nofollow"
            size="xs"
            ta="right"
          >
            {client.website}
          </Anchor>
        ) : (
          <Text size="xs" c="dimmed">
            —
          </Text>
        )}
      </Group>
      <Field label="Address" value={client.address} />

      <Divider label="Contact numbers" labelPosition="left" />
      {client.contact_numbers.length === 0 ? (
        <Text size="xs" c="dimmed">
          No contact numbers on file.
        </Text>
      ) : (
        // Ordered primaries-first by the API; render as-is (§4).
        client.contact_numbers.map((c) => (
          <Group key={c.id} justify="space-between" gap="xs">
            <Text size="xs">{c.number}</Text>
            <Group gap={4}>
              <Text size="xs" c="dimmed" tt="capitalize">
                {c.label}
              </Text>
              {c.is_primary ? (
                <Badge size="xs" variant="light" color="blue">
                  Primary
                </Badge>
              ) : null}
            </Group>
          </Group>
        ))
      )}

      {client.notes ? (
        <>
          <Divider label="Notes" labelPosition="left" />
          <Text size="xs">{client.notes}</Text>
        </>
      ) : null}

      {client.status === "inactive" ? (
        <>
          <Divider label="Retirement" labelPosition="left" />
          <Field label="Reason" value={client.status_note} />
          <Field
            label="Retired at"
            value={
              client.retired_at_bs?.display ||
              (client.retired_at
                ? dayjs(client.retired_at).format("MMM D, YYYY h:mm A")
                : null)
            }
          />
          <Field label="Retired by" value={client.retired_by_username} />
        </>
      ) : null}

      <Divider label="Record" labelPosition="left" />
      <Field label="Added by" value={client.created_by_username} />
      <Field
        label="Created"
        value={
          client.created_at
            ? dayjs(client.created_at).format("MMM D, YYYY h:mm A")
            : null
        }
      />
      <Field
        label="Last updated"
        value={
          client.updated_at
            ? dayjs(client.updated_at).format("MMM D, YYYY h:mm A")
            : null
        }
      />
    </Stack>
  );
}
