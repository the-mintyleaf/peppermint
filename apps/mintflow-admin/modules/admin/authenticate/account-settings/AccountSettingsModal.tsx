"use client";

import { useState } from "react";
import {
  Box,
  CloseButton,
  Group,
  Modal,
  NavLink,
  ScrollArea,
  Stack,
  Text,
} from "@peppermint/ui";
import type { Icon } from "@phosphor-icons/react";
import { DesktopIcon } from "@phosphor-icons/react/dist/csr/Desktop";
import { KeyIcon } from "@phosphor-icons/react/dist/csr/Key";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { UserCircleIcon } from "@phosphor-icons/react/dist/csr/UserCircle";
import { PermissionsTab } from "./components/PermissionsTab";
import { ProfileTab } from "./components/ProfileTab";
import { SecurityTab } from "./components/SecurityTab";
import { SessionsTab } from "./components/SessionsTab";
import type {
  AccountSettingsModalProps,
  SettingsTab,
} from "./AccountSettingsModal.types";
import styles from "./AccountSettingsModal.module.css";

interface TabDefinition {
  id: SettingsTab;
  label: string;
  description: string;
  icon: Icon;
}

const TABS: TabDefinition[] = [
  {
    id: "profile",
    label: "Profile",
    description: "Your display name and contact email.",
    icon: UserCircleIcon,
  },
  {
    id: "security",
    label: "Security",
    description: "Password and two-factor authentication.",
    icon: ShieldCheckIcon,
  },
  {
    id: "sessions",
    label: "Sessions",
    description: "Devices currently signed in to your account.",
    icon: DesktopIcon,
  },
  {
    id: "permissions",
    label: "Permissions",
    description: "Roles and direct permissions assigned to you.",
    icon: KeyIcon,
  },
];

function TabContent({ tab }: { tab: TabDefinition }) {
  switch (tab.id) {
    case "profile":
      return <ProfileTab title={tab.label} description={tab.description} />;
    case "security":
      return <SecurityTab title={tab.label} description={tab.description} />;
    case "sessions":
      return <SessionsTab title={tab.label} description={tab.description} />;
    case "permissions":
      return <PermissionsTab title={tab.label} description={tab.description} />;
  }
}

export function AccountSettingsModal({
  opened,
  onClose,
}: AccountSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const active = TABS.find((tab) => tab.id === activeTab) ?? TABS[0];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={860}
      padding={0}
      radius="md"
      centered
      withCloseButton={false}
      title={undefined}
      aria-label="Account settings"
    >
      <Box className={styles.body}>
        <Box component="nav" className={styles.sidebar} aria-label="Settings">
          <Group gap="xs" px="xs" py={4} wrap="nowrap">
            <CloseButton
              size="sm"
              onClick={onClose}
              aria-label="Close settings"
            />
            <Text fw={600} size="xs">
              Settings
            </Text>
          </Group>
          <Stack gap={2} className={styles.nav}>
            {TABS.map((tab) => (
              <NavLink
                key={tab.id}
                component="button"
                type="button"
                label={
                  <Text size="xs" component="span">
                    {tab.label}
                  </Text>
                }
                leftSection={<tab.icon size={14} aria-hidden />}
                active={tab.id === active.id}
                onClick={() => setActiveTab(tab.id)}
                styles={{
                  root: {
                    padding: "4px 8px",
                    borderRadius: "var(--mantine-radius-sm)",
                  },
                  section: { marginInlineEnd: "var(--mantine-spacing-xs)" },
                }}
              />
            ))}
          </Stack>
        </Box>

        <Box className={styles.content}>
          <ScrollArea className={styles.contentScroll}>
            <Box p="lg">
              <TabContent tab={active} />
            </Box>
          </ScrollArea>
        </Box>
      </Box>
    </Modal>
  );
}
