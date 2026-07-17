"use client";

import { Box, ScrollArea, Skeleton, Stack, Text } from "@peppermint/ui";

import { useTasksStore } from "../../../Tasks.store";
import { taskGridStyle } from "../../taskGrid";
import { TaskGroupSection } from "../TaskGroupSection";
import type { TaskListViewProps } from "./TaskListView.types";
import tableClasses from "../../TaskTable.module.css";

export function TaskListView({
  groups,
  isLoading,
  total,
  hasActiveFilters,
  onReset,
}: TaskListViewProps) {
  const columns = useTasksStore((s) => s.visibleColumns);
  const gridStyle = taskGridStyle(columns);

  return (
    <>
      <Box
        className={`${tableClasses.table} ${tableClasses.header} ${tableClasses.grid}`}
        style={gridStyle}
      >
        <span className={tableClasses.headerLabel}>Name</span>
        <span />
        {columns.priority && (
          <span className={tableClasses.headerLabel}>Priority</span>
        )}
        <span className={tableClasses.headerLabel}>List</span>
        {columns.due && (
          <span className={tableClasses.headerLabel}>Due date</span>
        )}
        {columns.assignee && (
          <span className={tableClasses.headerLabel}>Assignee</span>
        )}
      </Box>

      <ScrollArea
        className={tableClasses.table}
        style={{ flex: 1, minHeight: 0 }}
      >
        {isLoading ? (
          <Stack p="md" gap="xs">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height={48} radius="sm" />
            ))}
          </Stack>
        ) : total === 0 ? (
          <Stack align="center" justify="center" h={300} gap="xs">
            <Text c="dimmed" size="sm">
              No tasks found
            </Text>
            {hasActiveFilters && (
              <Text
                size="xs"
                c="blue"
                style={{ cursor: "pointer" }}
                onClick={onReset}
              >
                Clear filters
              </Text>
            )}
          </Stack>
        ) : (
          <Box>
            {groups.map((group) => (
              <TaskGroupSection
                key={group.key}
                groupKey={group.key}
                label={group.label}
                tasks={group.tasks}
              />
            ))}
          </Box>
        )}
      </ScrollArea>
    </>
  );
}
