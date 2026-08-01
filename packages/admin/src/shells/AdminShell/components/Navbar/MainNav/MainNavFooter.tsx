"use client";

import { BookmarksMenu, Stack } from "@peppermint/ui";
import type {
  AdminShellAiButton,
  AdminShellSettingsButton,
} from "../../../AdminShell.types";
import { UserInfoPopover } from "../UserInfoPopover";
import type { UserInfoPopoverProps } from "../UserInfoPopover/UserInfoPopover.types";
import { MainNavAiButton } from "./MainNavAiButton";

import { MinusIcon } from "@phosphor-icons/react/dist/ssr";

const DEFAULT_SETTINGS_HREF = "/admin/settings";
const DEFAULT_SETTINGS_LABEL = "Settings";

interface MainNavFooterProps {
  aiButton?: AdminShellAiButton;
  settingsButton?: AdminShellSettingsButton;
  pathname?: string;
  userMenu?: UserInfoPopoverProps;
  onNavigate?: (href: string) => void;
}

export function MainNavFooter({
  aiButton,
  settingsButton,
  pathname,
  userMenu,
  onNavigate,
}: MainNavFooterProps) {
  const settingsHref = settingsButton?.href ?? DEFAULT_SETTINGS_HREF;

  return (
    <Stack gap={6} align="center" py="xs">
      <MainNavAiButton aiButton={aiButton} pathname={pathname} />

      <MinusIcon
        weight="fill"
        size={6}
        style={{
          opacity: 0.5,
          margin: "4px 0",
        }}
        color="var(--mantine-color-brand-6)"
      />

      <BookmarksMenu variant="sidenav" onNavigate={onNavigate} />

      <UserInfoPopover variant="icon" {...userMenu} />
    </Stack>
  );
}
