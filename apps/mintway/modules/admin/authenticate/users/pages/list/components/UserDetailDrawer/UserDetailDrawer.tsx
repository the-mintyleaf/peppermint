"use client";

import {
  Divider,
  Drawer,
  Group,
  Stack,
  Tabs,
  Text,
  dayjs,
} from "@peppermint/ui";
import { StatusBadge } from "@peppermint/admin";
import type {
  AccountStatus,
  Role,
} from "@/modules/admin/authenticate/_shared/authenticate.types";
import type { UserAdmin } from "../../../../users.types";
import { UserSessionsPanel } from "./UserSessionsPanel";
import type { UserDetailDrawerProps } from "./UserDetailDrawer.types";

const ROLE_COLORS: Partial<Record<Role, string>> = {
  superadmin: "grape",
  admin: "blue",
  staff: "gray",
};
const STATUS_COLORS: Partial<Record<AccountStatus, string>> = {
  active: "teal",
  suspended: "orange",
  deactivated: "gray",
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
  const d = dayjs(value);
  return d.isValid() ? d.format("MMM D, YYYY h:mm A") : value;
}

function Overview({ user }: { user: UserAdmin }) {
  const p = user.employee_profile;
  return (
    <Stack gap="sm">
      <Group gap="xs">
        <StatusBadge<Role> value={user.role} colorMap={ROLE_COLORS} />
        <StatusBadge<AccountStatus>
          value={user.account_status}
          colorMap={STATUS_COLORS}
        />
      </Group>
      <Divider label="Account" labelPosition="left" />
      <Field label="Username" value={user.username} />
      <Field
        label="Password change required"
        value={user.password_change_required ? "Yes" : "No"}
      />
      <Field label="Last login" value={fmtDate(user.last_login_at)} />
      <Field label="Created" value={fmtDate(user.created_at)} />
      {user.deactivated_at ? (
        <Field label="Deactivated" value={fmtDate(user.deactivated_at)} />
      ) : null}
      {user.suspended_at ? (
        <Field label="Suspended" value={fmtDate(user.suspended_at)} />
      ) : null}
      <Divider label="Employee profile" labelPosition="left" />
      <Field label="Employee code" value={p.employee_code} />
      <Field
        label="Name"
        value={[p.first_name, p.middle_name, p.last_name]
          .filter(Boolean)
          .join(" ")}
      />
      {p.preferred_name ? (
        <Field label="Preferred name" value={p.preferred_name} />
      ) : null}
      <Field label="Job title" value={p.job_title} />
      <Field label="Employment start" value={p.employment_start_date} />
      <Field label="Employment end" value={p.employment_end_date} />
      <Field
        label="Employment status"
        value={p.employment_status === "active" ? "Active" : "Ended"}
      />
      <Field label="Contact email" value={p.email} />
      <Field label="Contact phone" value={p.phone} />
    </Stack>
  );
}

export function UserDetailDrawer({
  user,
  opened,
  onClose,
  isSuperadmin,
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
            {isSuperadmin ? (
              <Tabs.Tab value="sessions">Sessions</Tabs.Tab>
            ) : null}
          </Tabs.List>
          <Tabs.Panel value="overview" pt="md">
            <Overview user={user} />
          </Tabs.Panel>
          {isSuperadmin ? (
            <Tabs.Panel value="sessions" pt="md">
              <UserSessionsPanel userId={user.id} username={user.username} />
            </Tabs.Panel>
          ) : null}
        </Tabs>
      ) : null}
    </Drawer>
  );
}
