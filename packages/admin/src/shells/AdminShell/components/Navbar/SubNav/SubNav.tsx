"use client";

import { ActionIcon, Divider, Group, Stack, Text } from "@zetsel/ui";
import { ArrowLineLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLineLeft";
import { SubNavLinks } from "./SubNavLinks";
import type { AdminShellMainNavModule } from "../../../AdminShell.types";
import {
  NAV_HEADER_HEIGHT,
  SUB_NAV_WIDTH,
  shellCardStyle,
} from "../../../shell.constants";

interface SubNavProps {
  module: AdminShellMainNavModule;
  pathname: string;
  onCollapse: () => void;
  visible: boolean;
}

export function SubNav({ module, pathname, onCollapse, visible }: SubNavProps) {
  return (
    <Stack
      gap={0}
      h="100%"
      bg="rgba(255,255,255,.04)"
      style={{
        flexShrink: 0,
        color: "white",
        width: visible ? SUB_NAV_WIDTH : 0,
        opacity: visible ? 1 : 0,
        overflow: "hidden",
        transition: visible
          ? "width 220ms ease 0ms, opacity 180ms ease 200ms"
          : "opacity 150ms ease 0ms, width 220ms ease 130ms",
        ...shellCardStyle,
      }}
    >
      <Group
        h={NAV_HEADER_HEIGHT}
        px="md"
        justify="space-between"
        align="center"
        wrap="nowrap"
      >
        <Text size="lg" fw={300} lh="120%" c="white">
          {module.label}
        </Text>

        <ActionIcon
          size="sm"
          variant="subtle"
          color="gray.0"
          onClick={onCollapse}
          aria-label="Collapse sub navigation"
        >
          <ArrowLineLeftIcon weight="fill" size={14} />
        </ActionIcon>
      </Group>

      <Divider color="dark.7" mb="sm" />

      <Stack
        gap={0}
        p={0}
        style={{ flex: 1, overflowY: "auto" }}
      >
        {module.subNav.widget && (
          <Stack px="md">
            {module.subNav.widget}
          </Stack>
        )}

        <SubNavLinks groups={module.subNav.groups} pathname={pathname} />
      </Stack>
    </Stack>
  );
}
