"use client";

import { useMemo } from "react";
import { Badge, Box, Group, Stack, Text } from "@peppermint/ui";
import { useDndContext, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";

import { tokens } from "@/config/design";
import {
  AMBER,
  AMBER_SOFT,
  FLOW_COLUMN_META,
  WIP_LIMIT,
} from "../../../../module.api";
import { FlowCard } from "../FlowCard";
import type { FlowColumnProps } from "./FlowColumn.types";

const DOT: Record<string, string> = {
  up_next: tokens.blue,
  in_progress: tokens.accent,
  done: tokens.greenSoft,
};

export function FlowColumn({
  column,
  tasks,
  wipCount = 0,
  wipFull = false,
  onOpen,
  onQuickComplete,
}: FlowColumnProps) {
  const meta = FLOW_COLUMN_META[column];
  const { active } = useDndContext();
  const { setNodeRef, isOver } = useDroppable({ id: column });
  const isDragging = active !== null;
  const isWip = column === "in_progress";

  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  return (
    <Box
      ref={setNodeRef}
      style={{
        flex: "1 1 0",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        borderRadius: tokens.radius.card,
        background: "rgba(0,0,0,0.015)",
        border:
          isDragging && isOver
            ? `1px solid ${tokens.lineStrong}`
            : `1px solid ${tokens.line}`,
        boxShadow:
          isDragging && isOver ? `inset 0 0 0 1px ${tokens.line}` : undefined,
        transition: "border-color .16s ease, box-shadow .16s ease",
      }}
    >
      <Box px={14} pt={13} pb={10}>
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap={8} wrap="nowrap">
            <Box
              w={7}
              h={7}
              style={{ borderRadius: "50%", background: DOT[column] }}
            />
            <Text fz="12px" fw={700} c={tokens.ink}>
              {meta.label}
            </Text>
            <Badge size="sm" variant="light" color="gray" radius="sm">
              {tasks.length}
            </Badge>
          </Group>

          {isWip ? (
            <Text
              fz="10px"
              fw={700}
              ff="monospace"
              c={wipFull ? AMBER : "rgba(0,0,0,0.4)"}
            >
              {wipCount} / {WIP_LIMIT} limit
            </Text>
          ) : null}
        </Group>

        {/* Calm amber board notice when In progress is full (spec §6). */}
        {isWip && wipFull ? (
          <Group
            gap={8}
            wrap="nowrap"
            align="flex-start"
            mt={10}
            p={9}
            style={{ borderRadius: 10, background: AMBER_SOFT }}
          >
            <WarningIcon
              size={14}
              weight="fill"
              color={AMBER}
              style={{ flex: "0 0 auto", marginTop: 1 }}
            />
            <Text fz="11px" fw={500} c={AMBER} style={{ lineHeight: 1.35 }}>
              In progress is full. Finish or hand off one task before starting
              another — it keeps the day realistic.
            </Text>
          </Group>
        ) : null}
      </Box>

      <Box px={10} pb={12} style={{ flex: 1, minHeight: 0 }}>
        {tasks.length > 0 ? (
          <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            <Stack gap={8}>
              {tasks.map((task) => (
                <FlowCard
                  key={task.id}
                  task={task}
                  onOpen={onOpen}
                  onQuickComplete={onQuickComplete}
                />
              ))}
            </Stack>
          </SortableContext>
        ) : (
          <Box
            style={{
              minHeight: 96,
              border: `2px dashed ${tokens.line}`,
              borderRadius: tokens.radius.card,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text fz="11px" fw={500} c="rgba(0,0,0,0.35)">
              {meta.hint}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
