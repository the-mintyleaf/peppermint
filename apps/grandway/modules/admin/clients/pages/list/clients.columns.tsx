"use client";

import { Avatar, Group, Text, dayjs } from "@peppermint/ui";
import type { DataTableShellColumn } from "@peppermint/admin";
import { StatusBadge } from "@peppermint/admin";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { EnvelopeIcon } from "@phosphor-icons/react/dist/csr/Envelope";
import { PhoneIcon } from "@phosphor-icons/react/dist/csr/Phone";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import type { ClientRow, ClientStatus } from "../../clients.types";
import { ClientRowActionsMenu } from "./components/ClientRowActionsMenu";

interface ClientsColumnsOptions {
  onViewDetails: (client: ClientRow) => void;
}

const STATUS_COLORS: Record<ClientStatus, string> = {
  active: "teal",
  inactive: "gray",
};
const STATUS_LABELS: Record<ClientStatus, string> = {
  active: "Active",
  inactive: "Retired",
};

export function getClientsColumns({
  onViewDetails,
}: ClientsColumnsOptions): DataTableShellColumn<ClientRow>[] {
  return [
    {
      accessor: "name",
      title: "Client",
      icon: BuildingsIcon,
      render: (client) => (
        <Group gap="xs" wrap="nowrap">
          {/* Plain external URL — Avatar renders an <img>, not next/image (§3/§9). */}
          <Avatar src={client.logo_url || undefined} size="sm" radius="sm">
            {client.name.charAt(0).toUpperCase()}
          </Avatar>
          <Text size="xs" fw={500}>
            {client.name}
          </Text>
        </Group>
      ),
    },
    {
      accessor: "spokesperson_name",
      title: "Spokesperson",
      icon: UserIcon,
      render: (client) =>
        client.spokesperson_name ? (
          <Text size="xs">{client.spokesperson_name}</Text>
        ) : (
          <Text size="xs" c="dimmed">
            —
          </Text>
        ),
    },
    {
      accessor: "email",
      title: "Email",
      icon: EnvelopeIcon,
      render: (client) =>
        client.email ? (
          <Text size="xs">{client.email}</Text>
        ) : (
          <Text size="xs" c="dimmed">
            —
          </Text>
        ),
    },
    {
      accessor: "primary_contact_number",
      title: "Phone",
      icon: PhoneIcon,
      render: (client) =>
        client.primary_contact_number ? (
          <Text size="xs">{client.primary_contact_number}</Text>
        ) : (
          <Text size="xs" c="dimmed">
            —
          </Text>
        ),
    },
    {
      accessor: "status",
      title: "Status",
      icon: PulseIcon,
      render: (client) => (
        <StatusBadge<ClientStatus>
          value={client.status}
          colorMap={STATUS_COLORS}
          labelMap={STATUS_LABELS}
        />
      ),
    },
    {
      accessor: "updated_at",
      title: "Updated",
      icon: ClockIcon,
      render: (client) => {
        const d = client.updated_at ? dayjs(client.updated_at) : null;
        return d && d.isValid() ? (
          <Text size="xs">{d.format("MMM D, YYYY")}</Text>
        ) : (
          <Text size="xs" c="dimmed">
            —
          </Text>
        );
      },
    },
    {
      accessor: "actions",
      title: "",
      textAlign: "right",
      render: (client) => (
        <ClientRowActionsMenu client={client} onViewDetails={onViewDetails} />
      ),
    },
  ];
}
