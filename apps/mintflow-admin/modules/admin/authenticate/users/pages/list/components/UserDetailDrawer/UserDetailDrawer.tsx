"use client";

import { Drawer, Tabs } from "@peppermint/ui";
import { ClipboardTextIcon } from "@phosphor-icons/react/dist/csr/ClipboardText";
import { DevicesIcon } from "@phosphor-icons/react/dist/csr/Devices";
import { RobotIcon } from "@phosphor-icons/react/dist/csr/Robot";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";

import { AuthEventsTab } from "./components/AuthEventsTab";
import { MfaTab } from "./components/MfaTab";
import { OverviewTab } from "./components/OverviewTab";
import { ServiceAccountsTab } from "./components/ServiceAccountsTab";
import { SessionsTab } from "./components/SessionsTab";
import type { UserDetailDrawerProps } from "./UserDetailDrawer.types";

export function UserDetailDrawer({
  user,
  opened,
  onClose,
}: UserDetailDrawerProps) {
  if (!user) return null;

  const isHuman = user.actor_type === "human";

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={user.display_name}
      size="lg"
      position="right"
    >
      <Tabs defaultValue="overview" keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab
            value="overview"
            leftSection={<UserIcon size={14} aria-hidden />}
          >
            Overview
          </Tabs.Tab>
          <Tabs.Tab
            value="sessions"
            leftSection={<DevicesIcon size={14} aria-hidden />}
          >
            Sessions
          </Tabs.Tab>
          <Tabs.Tab
            value="auth-events"
            leftSection={<ClipboardTextIcon size={14} aria-hidden />}
          >
            Auth Events
          </Tabs.Tab>
          <Tabs.Tab
            value="mfa"
            leftSection={<ShieldCheckIcon size={14} aria-hidden />}
          >
            MFA
          </Tabs.Tab>
          {!isHuman && (
            <Tabs.Tab
              value="service-accounts"
              leftSection={<RobotIcon size={14} aria-hidden />}
            >
              Service Accounts
            </Tabs.Tab>
          )}
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <OverviewTab user={user} />
        </Tabs.Panel>
        <Tabs.Panel value="sessions" pt="md">
          <SessionsTab userId={user.id} />
        </Tabs.Panel>
        <Tabs.Panel value="auth-events" pt="md">
          <AuthEventsTab userId={user.id} />
        </Tabs.Panel>
        <Tabs.Panel value="mfa" pt="md">
          <MfaTab userId={user.id} />
        </Tabs.Panel>
        {!isHuman && (
          <Tabs.Panel value="service-accounts" pt="md">
            <ServiceAccountsTab userId={user.id} />
          </Tabs.Panel>
        )}
      </Tabs>
    </Drawer>
  );
}
