"use client";

import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Menu,
  Progress,
  SimpleGrid,
  Stack,
  Text,
} from "@peppermint/ui";
import { DotsThreeIcon } from "@phosphor-icons/react/dist/csr/DotsThree";

import { MonoText, SectionLabel, StatusPill } from "@/components";
import { tokens } from "@/config/design";
import { WORK_PRIORITY_LABEL, WORK_STATUS_LABEL } from "@/lib/work";
import { PRIORITY_STYLE, STATUS_STYLE } from "../../../cases.styles";
import { availableWorkActions, WORK_ACTION_LABEL } from "../../caseView";
import type { WorkDetailProps } from "./WorkDetail.types";

interface MetricTileProps {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  dark?: boolean;
  children?: React.ReactNode;
}

function MetricTile({
  label,
  value,
  sub,
  subColor,
  dark,
  children,
}: MetricTileProps) {
  return (
    <Box
      p="14px 16px"
      style={{
        background: dark ? tokens.tile : tokens.paper2,
        borderRadius: 14,
      }}
    >
      <SectionLabel c={dark ? "rgba(255,255,255,0.55)" : tokens.muted}>
        {label}
      </SectionLabel>
      <MonoText
        fz="24px"
        fw={700}
        mt={8}
        c={dark ? tokens.paper : tokens.ink}
        style={{ lineHeight: 1.1 }}
      >
        {value}
      </MonoText>
      {sub ? (
        <Text
          fz="11px"
          fw={600}
          mt={2}
          c={subColor ?? (dark ? "rgba(255,255,255,0.55)" : tokens.muted)}
        >
          {sub}
        </Text>
      ) : null}
      {children}
    </Box>
  );
}

/**
 * Case detail card: status / priority badges, title + reference number + unit,
 * objective, and the four-metric strip (progress, open tasks, due, created).
 */
export function WorkDetail({
  view,
  onWorkAction,
  workActionPending,
}: WorkDetailProps) {
  const status = STATUS_STYLE[view.item.status];
  const priority = PRIORITY_STYLE[view.priority];
  const { progress } = view;
  const openTasks = progress.total - progress.done;
  const workActions = onWorkAction
    ? availableWorkActions(view.item.status)
    : [];

  return (
    <Stack gap={0}>
      <Group gap={9} align="center" wrap="wrap">
        <StatusPill fg={status.fg} bg={status.bg} fz="11px" dot={status.fg}>
          {WORK_STATUS_LABEL[view.item.status]}
        </StatusPill>
        <Badge color={priority.color} variant="light" radius="sm" size="md">
          {WORK_PRIORITY_LABEL[view.priority]}
        </Badge>
        {view.reviewRequired ? (
          <StatusPill fg={tokens.purpleInk} bg={tokens.purpleSoft} fz="11px">
            Review required
          </StatusPill>
        ) : null}
        <Box style={{ flex: 1 }} />
        {onWorkAction && workActions.length > 0 ? (
          <Menu shadow="sm" width={180} position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                loading={workActionPending}
                aria-label="Case actions"
              >
                <DotsThreeIcon size={20} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {workActions.map((action) => (
                <Menu.Item
                  key={action}
                  color={action === "archive" ? "red" : undefined}
                  onClick={() => onWorkAction(action)}
                >
                  {WORK_ACTION_LABEL[action]}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        ) : (
          <DotsThreeIcon size={20} color={tokens.muted} aria-label="Case" />
        )}
      </Group>

      <Text
        fz="26px"
        fw={700}
        mt={16}
        c={tokens.ink}
        style={{ letterSpacing: "-0.02em", lineHeight: 1.15 }}
      >
        {view.title}
      </Text>
      <Group gap={10} mt={6} wrap="wrap">
        <MonoText fz="12px" fw={600} c={tokens.muted}>
          {view.referenceNumber}
        </MonoText>
        <Text fz="12px" c={tokens.muted}>
          {view.unitName}
        </Text>
      </Group>
      <Text
        fz="14px"
        mt={12}
        c={tokens.muted2}
        maw={660}
        style={{ lineHeight: 1.6 }}
      >
        {view.objective}
      </Text>

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing={10} mt={22}>
        <MetricTile
          dark
          label="Progress"
          value={`${progress.pct}%`}
          sub={`${progress.done} of ${progress.total} tasks`}
        >
          <Progress
            value={progress.pct}
            color="accent"
            size="sm"
            radius="xl"
            mt={10}
            aria-label={`Progress ${progress.pct}%`}
          />
        </MetricTile>
        <MetricTile
          label="Open tasks"
          value={`${openTasks}`}
          sub={`${progress.total} total`}
        />
        <MetricTile
          label="Due"
          value={view.dueLabel || "—"}
          sub={view.dueBs || undefined}
        />
        <MetricTile
          label="Created"
          value={view.createdLabel}
          sub={`Updated ${view.updatedLabel}`}
        />
      </SimpleGrid>
    </Stack>
  );
}
