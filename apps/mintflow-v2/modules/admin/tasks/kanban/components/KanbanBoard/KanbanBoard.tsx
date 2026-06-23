"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Box } from "@peppermint/ui";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type {
  CollisionDetection,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { KanbanColumn } from "../KanbanColumn";
import { KanbanCard } from "../KanbanCard";
import type { KanbanBoardProps } from "./KanbanBoard.types";
import type { Task, TaskStatus } from "../../module.api";

const COLUMN_ORDER: TaskStatus[] = ["inbox", "ongoing", "hold", "rejected"];
const STATUS_SET = new Set<string>(COLUMN_ORDER);

function buildTaskStatusMap(tasksByStatus: Record<string, Task[]>): Map<string, string> {
  const map = new Map<string, string>();
  for (const status of COLUMN_ORDER) {
    for (const task of tasksByStatus[status] ?? []) {
      map.set(task.id, status);
    }
  }
  return map;
}

function createCollisionDetection(taskStatusMap: Map<string, string>): CollisionDetection {
  return (args) => {
    const columnCollisions = pointerWithin({
      ...args,
      droppableContainers: args.droppableContainers.filter((c) =>
        STATUS_SET.has(String(c.id))
      ),
    });

    if (columnCollisions.length > 0) {
      const hoveredColumn = String(columnCollisions[0].id);
      const cardsInColumn = args.droppableContainers.filter((c) => {
        const id = String(c.id);
        return !STATUS_SET.has(id) && taskStatusMap.get(id) === hoveredColumn;
      });

      if (cardsInColumn.length > 0) {
        const cardCollisions = closestCenter({
          ...args,
          droppableContainers: cardsInColumn,
        });
        if (cardCollisions.length > 0) return cardCollisions;
      }

      return columnCollisions;
    }

    return closestCenter(args);
  };
}

function findTaskById(tasksByStatus: Record<string, Task[]>, id: string | null): Task | undefined {
  if (!id) return undefined;
  for (const tasks of Object.values(tasksByStatus)) {
    const t = tasks.find((t) => t.id === id);
    if (t) return t;
  }
}

function findStatusForTask(tasksByStatus: Record<string, Task[]>, taskId: string): string | undefined {
  return COLUMN_ORDER.find((s) => (tasksByStatus[s] ?? []).some((t) => t.id === taskId));
}

export function KanbanBoard({ tasksByStatus, onMoveTask, onReorderTask, onCardClick, onAddTask }: KanbanBoardProps) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const lastOverId = useRef<string | null>(null);

  const activeTask = useMemo(
    () => findTaskById(tasksByStatus, activeTaskId),
    [tasksByStatus, activeTaskId]
  );

  const taskStatusMap = useMemo(() => buildTaskStatusMap(tasksByStatus), [tasksByStatus]);
  const collisionDetection = useMemo(
    () => createCollisionDetection(taskStatusMap),
    [taskStatusMap]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveTaskId(event.active.id as string);
    lastOverId.current = null;
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || over.id === active.id) return;

      const overId = String(over.id);
      if (overId === lastOverId.current) return;
      lastOverId.current = overId;

      if (STATUS_SET.has(overId)) return;

      const taskId = String(active.id);
      const fromStatus = findStatusForTask(tasksByStatus, taskId);
      const toStatus = findStatusForTask(tasksByStatus, overId);

      if (fromStatus && toStatus && fromStatus === toStatus) {
        onReorderTask(taskId, overId);
      }
    },
    [tasksByStatus, onReorderTask]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTaskId(null);
      lastOverId.current = null;

      if (!over || active.id === over.id) return;

      const taskId = String(active.id);
      const overId = String(over.id);
      const fromStatus = findStatusForTask(tasksByStatus, taskId);
      if (!fromStatus) return;

      const toStatus = STATUS_SET.has(overId)
        ? overId
        : findStatusForTask(tasksByStatus, overId);

      if (toStatus && fromStatus !== toStatus) {
        onMoveTask(taskId, fromStatus, toStatus);
      }
    },
    [tasksByStatus, onMoveTask]
  );

  return (
    <Box style={{ height: "100%", minHeight: "calc(100vh - 180px)" }}>
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 16,
          alignItems: "stretch",
          minHeight: "calc(100vh - 180px)",
          height: "100%",
        }}
      >
        {COLUMN_ORDER.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status] ?? []}
            onCardClick={onCardClick}
            onAddTask={onAddTask}
          />
        ))}
      </Box>

      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.18,0.67,0.6,1.22)" }}>
        {activeTask ? <KanbanCard task={activeTask} overlay /> : null}
      </DragOverlay>
    </DndContext>
    </Box>
  );
}
