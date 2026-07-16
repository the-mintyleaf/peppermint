"use client";

import {
  ActionIcon,
  Avatar,
  Box,
  Group,
  Menu,
  Stack,
  Text,
} from "@peppermint/ui";
import { DotsThreeIcon } from "@phosphor-icons/react/dist/csr/DotsThree";
import { TreeStructureIcon } from "@phosphor-icons/react/dist/csr/TreeStructure";

import { CaseIcon, MonoText } from "@/components";
import { tokens } from "@/config/design";
import { CASE_STYLE } from "../../../module.api";
import type { CaseCardProps } from "./CaseCard.types";

export function CaseCard({ workCase, onOpen }: CaseCardProps) {
  const style = CASE_STYLE[workCase.category];

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={() => onOpen(workCase)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(workCase);
        }
      }}
      p="md"
      style={{
        background: tokens.paper,
        border: `1px solid ${tokens.line}`,
        borderRadius: tokens.radius.card,
        cursor: "pointer",
        transition: "transform 0.16s ease, box-shadow 0.16s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = tokens.shadow.card;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <Group align="flex-start" justify="space-between" wrap="nowrap">
        <CaseIcon
          kind={style.icon}
          color={style.color}
          tint={style.tint}
          size={44}
        />
        <Menu shadow="sm" width={160} position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              aria-label="Case actions"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <DotsThreeIcon size={18} weight="bold" />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
            <Menu.Item onClick={() => onOpen(workCase)}>Open case</Menu.Item>
            <Menu.Item>Rename</Menu.Item>
            <Menu.Item>Share</Menu.Item>
            <Menu.Item color="red">Delete</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Stack gap={2} mt="sm">
        <Text fw={700} size="sm" lineClamp={1}>
          {workCase.name}
        </Text>
        <MonoText c={tokens.muted} fz="11px">
          {workCase.fileCount} files · {workCase.size}
        </MonoText>
      </Stack>

      <Group justify="space-between" align="center" mt="md" wrap="nowrap">
        <Group gap={6} wrap="nowrap" align="center">
          <Avatar.Group spacing="sm">
            {workCase.people.slice(0, 3).map((p) => (
              <Avatar key={p.id} size={22} radius="xl" color={p.color}>
                {p.initials}
              </Avatar>
            ))}
          </Avatar.Group>
          <Group gap={3} wrap="nowrap" align="center" c={tokens.muted}>
            <TreeStructureIcon size={11} weight="fill" />
            <MonoText fz="10px" c={tokens.muted}>
              {workCase.taskCount}
            </MonoText>
          </Group>
        </Group>
        <MonoText fz="10px" c={tokens.muted}>
          {workCase.modified}
        </MonoText>
      </Group>
    </Box>
  );
}
