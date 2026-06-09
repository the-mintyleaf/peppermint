"use client";

import { ActionIcon, Indicator, Stack } from "@zetsel/ui";
import { Bell as BellIcon } from "@phosphor-icons/react/dist/csr/Bell";
import { SpeakerLow as SpeakerLowIcon } from "@phosphor-icons/react/dist/csr/SpeakerLow";
import type { Icon } from "@phosphor-icons/react";
import { UserInfoPopover } from "../UserInfoPopover";
import type { UserInfoPopoverProps } from "../UserInfoPopover/UserInfoPopover.types";
import { MainNavAiButton } from "./MainNavAiButton";
import type { AdminShellAiButton } from "../../../AdminShell.types";

interface MainNavFooterProps {
  brandIcon: Icon;
  aiButton?: AdminShellAiButton;
  pathname?: string;
  userMenu?: UserInfoPopoverProps;
}

const footerIconStyles = {
  root: {
    color: "var(--mantine-color-gray-3)",
    "&:hover": {
      backgroundColor: "var(--mantine-color-gray-8)",
      color: "var(--mantine-color-gray-0)",
    },
  },
};

export function MainNavFooter({
  brandIcon,
  aiButton,
  pathname,
  userMenu,
}: MainNavFooterProps) {
  return (
    <Stack gap="xs" align="center" py="sm">
      <MainNavAiButton
        brandIcon={brandIcon}
        aiButton={aiButton}
        pathname={pathname}
      />

      <Indicator inline size={6} offset={4} position="top-end" color="red">
        <ActionIcon
          variant="subtle"
          size="md"
          aria-label="Notifications"
          styles={footerIconStyles}
        >
          <BellIcon size={18} />
        </ActionIcon>
      </Indicator>

      <Indicator inline size={6} offset={4} position="top-end" color="red">
        <ActionIcon
          variant="subtle"
          size="md"
          aria-label="Alerts"
          styles={footerIconStyles}
        >
          <SpeakerLowIcon size={18} />
        </ActionIcon>
      </Indicator>

      <UserInfoPopover variant="icon" {...userMenu} />
    </Stack>
  );
}
