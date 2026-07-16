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
  notifications,
} from "@peppermint/ui";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";

import { tokens } from "@/config/design";
import {
  useCaseProfile,
  useProfileView,
  useVisibleActivity,
} from "./CaseProfile.hooks";
import { InsightsRail, TaskStrip, WorkDetail, WorkTabs } from "./components";
import type { ModuleCaseProfileProps } from "./CaseProfile.types";

function notConnected() {
  notifications.show({ message: "Not connected yet", color: "gray" });
}

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

  const { data, isLoading, isError, refetch } = useCaseProfile(caseId);
  const { taskId, toggleTask, setTaskId, tab, setTab } = useProfileView();
  const activity = useVisibleActivity(data?.activity, taskId);

  const workCase = data?.workCase;
  const filterTask = workCase?.tasks.find((t) => t.id === taskId);

  const breadcrumb = [
    { label: "Cases", href: "/cases" },
    { label: workCase?.title ?? "Case", href: `/cases/${caseId}` },
  ];

  const headerRight = (
    <Group gap="sm" mr="sm" wrap="nowrap">
      {workCase ? (
        <Avatar.Group spacing="sm">
          {workCase.officers.map((o) => (
            <Avatar
              key={o.id}
              color={o.color}
              radius="xl"
              size={30}
              styles={{ placeholder: { fontSize: 11, fontWeight: 700 } }}
            >
              {o.initials}
            </Avatar>
          ))}
        </Avatar.Group>
      ) : null}
      <AccessMenu data={{ accounts: [], roles: [] }} />
      <Button
        size="xs"
        leftSection={<PlusIcon size={16} aria-label="Add task" />}
        onClick={notConnected}
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
          ) : !workCase ? (
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
                {workCase.title}
              </Title>

              <Stack gap={14}>
                {workCase.tasks.length > 0 ? (
                  <TaskStrip
                    tasks={workCase.tasks}
                    selectedId={taskId}
                    onToggle={toggleTask}
                  />
                ) : null}

                <Grid columns={10} gap={12} align="stretch">
                  <Grid.Col span={{ base: 10, lg: 7 }}>
                    <Stack gap={12}>
                      <Box p={26} style={CARD_STYLE}>
                        <WorkDetail workCase={workCase} />
                      </Box>
                      <Box p={22} style={CARD_STYLE}>
                        <WorkTabs
                          workCase={workCase}
                          files={data?.files ?? []}
                          activity={activity}
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
                        workCase={workCase}
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
    </>
  );
}
