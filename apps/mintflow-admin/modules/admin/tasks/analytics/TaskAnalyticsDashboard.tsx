"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  ModalPaper,
  ModuleHeader,
  Skeleton,
  Stack,
  useDebouncedValue,
} from "@peppermint/ui";
import { TaskDetailModal } from "../kanban/components/TaskDetailModal";
import type { Task } from "../kanban/module.api";
import { ArchiveProjects } from "./components/ArchiveProjects";
import { FeaturedUpcomingTask } from "./components/FeaturedUpcomingTask";
import { MiniCalendar } from "./components/MiniCalendar";
import { PlanningSchedule } from "./components/PlanningSchedule";
import { TaskCategories } from "./components/TaskCategories";
import { WeeklyProductivity } from "./components/WeeklyProductivity";
import { useTaskAnalyticsDashboard } from "./TaskAnalyticsDashboard.hooks";
import { scheduledTaskToTask } from "./taskAnalytics.utils";
import type {
  DashboardView,
  ScheduledTask,
  TaskCategoryFilter,
} from "./taskAnalytics.types";

function formatMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

const BREADCRUMB = [
  { label: "Tasks", href: "/admin/tasks" },
  { label: "Analytics", href: "#" },
];

export function TaskAnalyticsDashboard() {
  const [selectedMonth, setSelectedMonth] = useState(new Date(2025, 5, 1));
  const [view, setView] = useState<DashboardView>("card");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchInput, 300);
  const [calendarFilter, setCalendarFilter] = useState("Yours");
  const [activeCategories, setActiveCategories] = useState<
    Set<TaskCategoryFilter>
  >(new Set());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const monthKey = formatMonthKey(selectedMonth);
  const { data, isLoading } = useTaskAnalyticsDashboard(monthKey);

  useEffect(() => {
    if (data) {
      const defaults = data.categories
        .filter((c) => c.defaultChecked)
        .map((c) => c.id);
      setActiveCategories(new Set(defaults));
    }
  }, [data]);

  const handleCategoryToggle = useCallback((id: TaskCategoryFilter) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleTaskClick = useCallback((task: ScheduledTask) => {
    setSelectedTask(scheduledTaskToTask(task));
  }, []);

  const handleCloseModal = useCallback(() => setSelectedTask(null), []);

  const filteredTasks = useMemo(() => {
    if (!data) return [];
    const q = debouncedSearch.trim().toLowerCase();
    return data.scheduledTasks.filter((task) => {
      const matchesSearch =
        !q ||
        task.title.toLowerCase().includes(q) ||
        task.category.toLowerCase().includes(q);
      const matchesCategory =
        activeCategories.size === 0 ||
        activeCategories.has(task.categoryFilter);
      return matchesSearch && matchesCategory;
    });
  }, [data, debouncedSearch, activeCategories]);

  return (
    <>
      <ModuleHeader breadcrumbItems={BREADCRUMB} />

      <ModalPaper withBorder>
        <Stack gap={0} h="100%" style={{ overflow: "hidden" }}>
          {isLoading || !data ? (
            <Box p="md">
              <Skeleton h={48} mb="md" />
              <Skeleton h={400} />
            </Box>
          ) : (
            <Box
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              <Box
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(260px, 300px) 1fr",
                  gridTemplateRows: "auto auto",
                  gridTemplateAreas: `
                  "sidebar main"
                  "bottom  bottom"
                `,
                  gap: 8,
                  alignContent: "start",
                }}
              >
                <Stack
                  gap={8}
                  style={{ gridArea: "sidebar", alignSelf: "start" }}
                >
                  <MiniCalendar
                    activeFilter={calendarFilter}
                    onFilterChange={setCalendarFilter}
                  />
                  <FeaturedUpcomingTask task={data.featuredTask} />
                  <TaskCategories
                    categories={data.categories}
                    activeCategories={activeCategories}
                    onToggle={handleCategoryToggle}
                  />
                </Stack>

                <Box style={{ gridArea: "main", minHeight: 480 }}>
                  <PlanningSchedule
                    days={data.scheduleDays}
                    tasks={filteredTasks}
                    view={view}
                    onTaskClick={handleTaskClick}
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                    onViewChange={setView}
                    search={searchInput}
                    onSearchChange={setSearchInput}
                    teamMembers={data.teamMembers}
                  />
                </Box>

                <Box
                  style={{
                    gridArea: "bottom",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  <WeeklyProductivity
                    data={data.productivity}
                    taskCount={data.selectedPeriodTaskCount}
                  />
                  <ArchiveProjects projects={data.archiveProjects} />
                </Box>
              </Box>
            </Box>
          )}
        </Stack>
      </ModalPaper>

      <TaskDetailModal task={selectedTask} onClose={handleCloseModal} />
    </>
  );
}
