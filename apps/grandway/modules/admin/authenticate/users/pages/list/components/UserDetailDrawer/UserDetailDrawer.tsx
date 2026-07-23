"use client";

import Link from "next/link";
import {
  Button,
  Divider,
  Drawer,
  Group,
  Stack,
  Tabs,
  Text,
} from "@peppermint/ui";
import { StatusBadge } from "@peppermint/admin";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";
import type {
  AuthorityType,
  User,
} from "@/modules/admin/authenticate/_shared/authenticate.types";
import { UserEventsPanel } from "./UserEventsPanel";
import { UserSessionsPanel } from "./UserSessionsPanel";
import type { UserDetailDrawerProps } from "./UserDetailDrawer.types";

const AUTHORITY_COLORS: Partial<Record<AuthorityType, string>> = {
  superadmin: "grape",
  admin: "blue",
  lead_manager: "gray",
};
const AUTHORITY_LABELS: Partial<Record<AuthorityType, string>> = {
  superadmin: "Superadmin",
  admin: "Admin",
  lead_manager: "Lead Manager",
};

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="md">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="xs" ta="right" c={value ? undefined : "dimmed"}>
        {value || "—"}
      </Text>
    </Group>
  );
}

function fmtDate(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

function Overview({ user }: { user: User }) {
  return (
    <Stack gap="sm">
      <Group gap="xs">
        <StatusBadge<AuthorityType>
          value={user.authority_type}
          colorMap={AUTHORITY_COLORS}
          labelMap={AUTHORITY_LABELS}
        />
        <StatusBadge<"active" | "blocked">
          value={user.is_active ? "active" : "blocked"}
          colorMap={{ active: "teal", blocked: "red" }}
          labelMap={{ active: "Active", blocked: "Blocked" }}
        />
        {user.mfa_enabled ? (
          <StatusBadge<"mfa">
            value="mfa"
            colorMap={{ mfa: "indigo" }}
            labelMap={{ mfa: "MFA enabled" }}
          />
        ) : null}
      </Group>
      <Divider label="Account" labelPosition="left" />
      <Field label="Username" value={user.username} />
      <Field label="Display name" value={user.display_name} />
      <Field label="Full name (English)" value={user.full_name_en} />
      <Field label="Full name (Nepali)" value={user.full_name_np} />
      <Field label="Email" value={user.email} />
      <Field label="Phone" value={user.phone} />
      <Field
        label="Password change required"
        value={user.must_change_password ? "Yes" : "No"}
      />
      <Field label="Last login" value={fmtDate(user.last_login)} />
      <Field label="Created" value={fmtDate(user.created_at)} />
      <Divider label="Investigate" labelPosition="left" />
      <Button
        component={Link}
        href={`/admin/audit?actor_id=${user.id}`}
        size="xs"
        variant="default"
        leftSection={<ClockCounterClockwiseIcon size={14} aria-hidden />}
      >
        View authentication activity in Audit
      </Button>
    </Stack>
  );
}

export function UserDetailDrawer({
  user,
  opened,
  onClose,
}: UserDetailDrawerProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      title={user ? `@${user.username}` : "User"}
    >
      {user ? (
        <Tabs defaultValue="overview" keepMounted={false}>
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="sessions">Sessions</Tabs.Tab>
            <Tabs.Tab value="events">Activity</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="overview" pt="md">
            <Overview user={user} />
          </Tabs.Panel>
          <Tabs.Panel value="sessions" pt="md">
            <UserSessionsPanel userId={user.id} username={user.username} />
          </Tabs.Panel>
          <Tabs.Panel value="events" pt="md">
            <UserEventsPanel userId={user.id} />
          </Tabs.Panel>
        </Tabs>
      ) : null}
    </Drawer>
  );
}
