"use client";

import { ActionIcon, Indicator, Stack } from "@peppermint/ui";
import { BellIcon } from "@phosphor-icons/react/dist/csr/Bell";
import { UserInfoPopover } from "../UserInfoPopover";
import type { UserInfoPopoverProps } from "../UserInfoPopover/UserInfoPopover.types";
import { MainNavAiButton } from "./MainNavAiButton";
import type { AdminShellAiButton } from "../../../AdminShell.types";

interface MainNavFooterProps {
  aiButton?: AdminShellAiButton;
  pathname?: string;
  userMenu?: UserInfoPopoverProps;
}

export function MainNavFooter({
  aiButton,
  pathname,
  userMenu,
}: MainNavFooterProps) {
  return (
    <Stack gap={6} align="center" py="xs">
      <MainNavAiButton aiButton={aiButton} pathname={pathname} />

      <Indicator inline size={4} offset={4} position="top-end" color="red">
        <ActionIcon
          variant="subtle"
          size="md"
          aria-label="Notifications"
          color="dark.2"
          styles={{
            root: {
              "&:hover": {
                backgroundColor: "var(--mantine-color-dark-6)",
                color: "var(--mantine-color-gray-0)",
              },
            },
          }}
        >
          <BellIcon weight="duotone" size={18} />
        </ActionIcon>
      </Indicator>

      <UserInfoPopover variant="icon" {...userMenu} />
    </Stack>
  );
}
