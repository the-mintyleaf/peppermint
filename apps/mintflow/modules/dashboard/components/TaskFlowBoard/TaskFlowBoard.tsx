"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Group,
  SegmentedControl,
  Stack,
  Text,
} from "@peppermint/ui";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";

import { useMediaQuery } from "@peppermint/ui";

import { SectionLabel } from "@/components";
import { FLOW_COLUMN_META } from "../../module.api";
import type { FlowColumn as FlowColumnKey, FlowTask } from "../../module.api";
import { FlowCard } from "./components/FlowCard";
import { FlowColumn } from "./components/FlowColumn";
import type { TaskFlowBoardProps } from "./TaskFlowBoard.types";

const COLUMN_ORDER: FlowColumnKey[] = ["up_next", "in_progress", "done"];

export function TaskFlowBoard({
  flowByColumn,
  wipCount,
  wipFull,
  onMove,
  onOpen,
  onQuickComplete,
  onQuickCreate,
}: TaskFlowBoardProps) {
  const [activeTask, setActiveTask] = useState<FlowTask | null>(null);
  const [mobileTab, setMobileTab] = useState<FlowColumnKey>("in_progress");
  const isMobile = useMediaQuery("(max-width: 48em)");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // taskId → column, to resolve the drop target when dropped over a card.
  const columnOf = useMemo(() => {
    const map = new Map<string, FlowColumnKey>();
    for (const col of COLUMN_ORDER)
      for (const t of flowByColumn[col]) map.set(t.id, col);
    return map;
  }, [flowByColumn]);

  const handleStart = ({ active }: DragStartEvent) => {
    const col = columnOf.get(String(active.id));
    setActiveTask(
      col ? (flowByColumn[col].find((t) => t.id === active.id) ?? null) : null,
    );
  };

  const handleEnd = ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    if (!over) return;
    const overId = String(over.id);
    const target: FlowColumnKey | undefined = COLUMN_ORDER.includes(
      overId as FlowColumnKey,
    )
      ? (overId as FlowColumnKey)
      : columnOf.get(overId);
    const from = columnOf.get(String(active.id));
    if (target && from && target !== from) onMove(String(active.id), target);
  };

  const mobileSegments = COLUMN_ORDER.map((col) => ({
    value: col,
    label: `${FLOW_COLUMN_META[col].label} (${flowByColumn[col].length})`,
  }));

  return (
    <Stack gap={14}>
      <Group justify="space-between" align="center" wrap="nowrap">
        <Stack gap={2}>
          <SectionLabel>Today&rsquo;s task flow</SectionLabel>
          <Text fz="13px" fw={500} c="rgba(0,0,0,0.5)">
            Your personal board — everything you&rsquo;re moving today.
          </Text>
        </Stack>
        <Button
          size="compact-sm"
          variant="light"
          color="gray"
          radius="xl"
          leftSection={<PlusIcon size={14} weight="bold" />}
          onClick={onQuickCreate}
        >
          Quick add
        </Button>
      </Group>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleStart}
        onDragEnd={handleEnd}
        onDragCancel={() => setActiveTask(null)}
      >
        {isMobile ? (
          <Stack gap={12}>
            <SegmentedControl
              fullWidth
              size="xs"
              radius="xl"
              value={mobileTab}
              onChange={(v) => setMobileTab(v as FlowColumnKey)}
              data={mobileSegments}
            />
            <FlowColumn
              column={mobileTab}
              tasks={flowByColumn[mobileTab]}
              wipCount={wipCount}
              wipFull={wipFull}
              onOpen={onOpen}
              onQuickComplete={onQuickComplete}
            />
          </Stack>
        ) : (
          <Box style={{ display: "flex", gap: 14, alignItems: "stretch" }}>
            {COLUMN_ORDER.map((col) => (
              <FlowColumn
                key={col}
                column={col}
                tasks={flowByColumn[col]}
                wipCount={wipCount}
                wipFull={wipFull}
                onOpen={onOpen}
                onQuickComplete={onQuickComplete}
              />
            ))}
          </Box>
        )}

        <DragOverlay>
          {activeTask ? (
            <FlowCard
              task={activeTask}
              overlay
              onOpen={onOpen}
              onQuickComplete={onQuickComplete}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </Stack>
  );
}
