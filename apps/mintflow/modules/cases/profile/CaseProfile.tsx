"use client";

import { useParams, useRouter } from "next/navigation";
import {
  AccessMenu,
  Avatar,
  Box,
  Button,
  Grid,
  Group,
  ModalPaper,
  ModuleHeader,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  Title,
  useDisclosure,
} from "@peppermint/ui";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";

import { tokens } from "@/config/design";
import {
  useArchiveTask,
  useArchiveWork,
  useCompleteTask,
  useRestoreWork,
  useStartTask,
  useStartWork,
} from "../cases.mutations";
import {
  useCaseProfile,
  useProfileView,
  useVisibleActivity,
} from "./CaseProfile.hooks";
import type { TaskActionKind, TaskChipView, WorkActionKind } from "./caseView";
import {
  CreateTaskModal,
  InsightsRail,
  TaskStrip,
  WorkDetail,
  WorkTabs,
} from "./components";
import type { ModuleCaseProfileProps } from "./CaseProfile.types";

const CARD_STYLE = {
  background: tokens.paper,
  border: `1px solid ${tokens.line}`,
  borderRadius: tokens.radius.card,
  boxShadow: tokens.shadow.card,
} as const;

function ProfileNotice({ children }: { children: React.ReactNode }) {
  return (
    <Stack align="center" justify="center" h={320} gap="sm">
      {children}
    </Stack>
  );
}

export function ModuleCaseProfile({
  caseId: caseIdProp,
}: ModuleCaseProfileProps = {}) {
  const params = useParams<{ caseId: string }>();
  const router = useRouter();
  const caseId = caseIdProp ?? params.caseId;

  const { view, activity, isLoading, isError, notFound, refetch } =
    useCaseProfile(caseId);
  const { taskId, toggleTask, setTaskId, tab, setTab } = useProfileView();
  const visibleActivity = useVisibleActivity(activity, taskId);

  const startTask = useStartTask(caseId);
  const completeTask = useCompleteTask(caseId);
  const archiveTask = useArchiveTask(caseId);
  const pendingTaskId =
    (startTask.isPending && startTask.variables?.taskId) ||
    (completeTask.isPending && completeTask.variables?.taskId) ||
    (archiveTask.isPending && archiveTask.variables?.taskId) ||
    null;

  const runTaskAction = (action: TaskActionKind, task: TaskChipView) => {
    const vars = {
      taskId: task.id,
      payload: { aggregate_version: task.version },
    };
    if (action === "start") startTask.mutate(vars);
    else if (action === "complete") completeTask.mutate(vars);
    else if (action === "archive") archiveTask.mutate(vars);
  };

  const startWork = useStartWork(caseId);
  const archiveWork = useArchiveWork(caseId);
  const restoreWork = useRestoreWork(caseId);
  const workActionPending =
    startWork.isPending || archiveWork.isPending || restoreWork.isPending;

  const runWorkAction = (action: WorkActionKind) => {
    const payload = { aggregate_version: view?.item.aggregate_version };
    if (action === "start") startWork.mutate(payload);
    else if (action === "archive") archiveWork.mutate(payload);
    else if (action === "restore") restoreWork.mutate(payload);
  };

  const [taskModalOpened, taskModal] = useDisclosure(false);

  const filterTask = view?.tasks.find((t) => t.id === taskId);

  const breadcrumb = [
    { label: "Cases", href: "/cases" },
    { label: view?.title ?? "Case", href: `/cases/${caseId}` },
  ];

  const headerRight = (
    <Group gap="sm" mr="sm" wrap="nowrap">
      {view && view.people.length > 0 ? (
        <Avatar.Group spacing="sm">
          {view.people.slice(0, 4).map((p) => (
            <Avatar
              key={p.id}
              color={p.color}
              radius="xl"
              size={30}
              styles={{ placeholder: { fontSize: 11, fontWeight: 700 } }}
            >
              {p.initials}
            </Avatar>
          ))}
        </Avatar.Group>
      ) : null}
      <AccessMenu data={{ accounts: [], roles: [] }} />
      <Button
        size="xs"
        leftSection={<PlusIcon size={16} aria-label="Add task" />}
        onClick={taskModal.open}
        disabled={!view}
      >
        Add task
      </Button>
    </Group>
  );

  return (
    <>
      <ModuleHeader breadcrumbItems={breadcrumb} right={headerRight} />

      <ModalPaper withBorder bg={tokens.paper2}>
        <ScrollArea h="100%" type="hover">
          {isLoading ? (
            <Stack p="md" gap={12}>
              <Skeleton height={44} width={280} radius="md" />
              <Skeleton height={52} radius="md" />
              <Grid columns={10} gap={12}>
                <Grid.Col span={{ base: 10, lg: 7 }}>
                  <Skeleton height={520} radius="lg" />
                </Grid.Col>
                <Grid.Col span={{ base: 10, lg: 3 }}>
                  <Skeleton height={520} radius="lg" />
                </Grid.Col>
              </Grid>
            </Stack>
          ) : isError ? (
            <ProfileNotice>
              <Text c="dimmed" size="sm">
                Couldn&apos;t load this case.
              </Text>
              <Button size="xs" variant="light" onClick={() => refetch()}>
                Try again
              </Button>
            </ProfileNotice>
          ) : notFound || !view ? (
            <ProfileNotice>
              <Text c="dimmed" size="sm">
                Case not found.
              </Text>
              <Button
                size="xs"
                variant="light"
                leftSection={<ArrowLeftIcon size={14} />}
                onClick={() => router.push("/cases")}
              >
                Back to Cases
              </Button>
            </ProfileNotice>
          ) : (
            <Box p="md">
              <Title
                order={1}
                fz={27}
                fw={700}
                c={tokens.ink}
                mb={16}
                style={{ letterSpacing: "-0.02em" }}
              >
                {view.title}
              </Title>

              <Stack gap={14}>
                {view.tasks.length > 0 ? (
                  <TaskStrip
                    tasks={view.tasks}
                    selectedId={taskId}
                    onToggle={toggleTask}
                    onAction={runTaskAction}
                    pendingTaskId={pendingTaskId}
                  />
                ) : null}

                <Grid columns={10} gap={12} align="stretch">
                  <Grid.Col span={{ base: 10, lg: 7 }}>
                    <Stack gap={12}>
                      <Box p={26} style={CARD_STYLE}>
                        <WorkDetail
                          view={view}
                          onWorkAction={runWorkAction}
                          workActionPending={workActionPending}
                        />
                      </Box>
                      <Box p={22} style={CARD_STYLE}>
                        <WorkTabs
                          view={view}
                          activity={visibleActivity}
                          tab={tab}
                          onTabChange={setTab}
                          filterLabel={filterTask?.title}
                          onClearFilter={() => setTaskId(null)}
                        />
                      </Box>
                    </Stack>
                  </Grid.Col>

                  <Grid.Col span={{ base: 10, lg: 3 }}>
                    <Box style={{ position: "sticky", top: 12 }}>
                      <InsightsRail
                        view={view}
                        onViewPeople={() => setTab("people")}
                      />
                    </Box>
                  </Grid.Col>
                </Grid>
              </Stack>
            </Box>
          )}
        </ScrollArea>
      </ModalPaper>

      {view ? (
        <CreateTaskModal
          workId={caseId}
          responsibleUnit={view.item.responsible_unit}
          opened={taskModalOpened}
          onClose={taskModal.close}
        />
      ) : null}
    </>
  );
}
