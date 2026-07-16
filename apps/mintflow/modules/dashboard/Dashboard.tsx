"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Group,
  Modal,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
  UnstyledButton,
} from "@peppermint/ui";
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowClockwise";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/csr/WarningCircle";

import { tokens } from "@/config/design";
import {
  useDashboard,
  useDashboardBoard,
  useDrawer,
  notConnected,
} from "./Dashboard.hooks";
import type { DashboardVariant } from "./Dashboard.hooks";
import { FocusHero } from "./components/FocusHero";
import { TaskFlowBoard } from "./components/TaskFlowBoard";
import { WorkFilesRail } from "./components/WorkFilesRail";
import { AttentionRail } from "./components/AttentionRail";
import { MetricsRail } from "./components/MetricsRail";
import { TaskDrawer } from "./components/TaskDrawer";
import type { DashboardData, FocusTask, Person } from "./module.api";

const GREETING_NAME = "Minister";
const TODAY = "Wednesday, 16 July";

/** Distinct people across the day's work files — the hero's avatar cluster. */
function collectTeam(data: DashboardData): Person[] {
  const seen = new Set<string>();
  const team: Person[] = [];
  for (const file of data.workFiles) {
    for (const person of file.team) {
      // Dedup on name — initials collide (two "AS" people would collapse).
      if (seen.has(person.name)) continue;
      seen.add(person.name);
      team.push(person);
    }
  }
  return team;
}

export function ModuleDashboard() {
  const router = useRouter();
  const [variant, setVariant] = useState<DashboardVariant>("populated");
  const { data, isLoading, isError, refetch } = useDashboard(variant);
  const board = useDashboardBoard(data);
  const drawer = useDrawer();

  const onStartFocus = (_task: FocusTask) => {
    void _task;
    notConnected();
  };

  const doneThisWeekRaw = Number(data?.kpis.find((k) => k.id === "k1")?.value);
  const doneThisWeek = Number.isFinite(doneThisWeekRaw) ? doneThisWeekRaw : 0;
  const onHoldNow = Object.values(board.flowByColumn)
    .flat()
    .filter((t) => t.onHold).length;

  const previewControl = (
    <SegmentedControl
      size="xs"
      radius="md"
      value={variant}
      onChange={(v) => setVariant(v as DashboardVariant)}
      data={[
        { value: "populated", label: "Today" },
        { value: "empty", label: "First run" },
      ]}
      aria-label="Preview populated or first-run dashboard"
    />
  );

  return (
    <>
      <Box mih="100%" style={{ padding: "20px 24px 40px" }}>
        {isLoading ? (
          <LoadingState />
        ) : isError || !data ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (
          <Box
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              alignItems: "flex-start",
            }}
          >
            {/* Primary column — focus hero, then the flow board */}
            <Stack gap={14} style={{ flex: "1 1 560px", minWidth: 0 }}>
              <FocusHero
                greetingName={GREETING_NAME}
                today={TODAY}
                focus={board.focus}
                team={collectTeam(data)}
                doneThisWeek={doneThisWeek}
                onHoldNow={onHoldNow}
                onToggleDone={board.toggleFocusDone}
                onContinue={onStartFocus}
                onChooseFocus={notConnected}
                previewControl={previewControl}
              />
              <TaskFlowBoard
                flowByColumn={board.flowByColumn}
                wipCount={board.wipCount}
                wipFull={board.wipFull}
                onMove={board.moveFlow}
                onOpen={drawer.open}
                onQuickComplete={board.quickComplete}
                onOpenTasks={() => router.push("/tasks")}
              />
            </Stack>

            {/* Rail — attention → work files → this week + momentum */}
            <Stack
              gap={12}
              style={{ flex: "1 1 320px", minWidth: 0, maxWidth: 360 }}
            >
              <AttentionRail
                items={data.attention}
                onAction={() => notConnected()}
              />
              <WorkFilesRail
                files={data.workFiles}
                onOpenFile={() => notConnected()}
                onViewAll={notConnected}
              />
              <MetricsRail
                kpis={data.kpis}
                momentum={data.momentum}
                onPlanTomorrow={notConnected}
              />
            </Stack>
          </Box>
        )}
      </Box>

      <TaskDrawer
        task={drawer.task}
        opened={drawer.opened}
        onClose={drawer.close}
        onComplete={(id) => {
          board.quickComplete(id);
          drawer.close();
        }}
        onMove={(id, to) => {
          board.moveFlow(id, to);
          drawer.close();
        }}
        onArchive={() => {
          notConnected();
          drawer.close();
        }}
      />

      {/* Auto-focus swap offer (spec §5) — never silently overwrites a pick */}
      <Modal
        opened={board.swapOffer !== null}
        onClose={board.dismissSwap}
        title="Focus is full — swap in this urgent task?"
        centered
        radius={tokens.radius.card}
      >
        {board.swapOffer ? (
          <Stack gap={14}>
            <Text fz="13px" fw={500} c={tokens.muted2}>
              <b>{board.swapOffer.incoming.title}</b> is high priority and due
              today. Pick a focus task to replace, or keep your current focus.
            </Text>
            <Stack gap={8}>
              {board.focus.map((f) => (
                <UnstyledButton
                  key={f.id}
                  onClick={() => board.acceptSwap(f.id)}
                  p={12}
                  style={{
                    borderRadius: 12,
                    border: `1px solid ${tokens.line}`,
                    textAlign: "left",
                  }}
                >
                  <Text fz="13px" fw={600} c={tokens.ink}>
                    Replace: {f.title}
                  </Text>
                </UnstyledButton>
              ))}
            </Stack>
            <Group justify="flex-end">
              <Button variant="subtle" color="gray" onClick={board.dismissSwap}>
                Keep current focus
              </Button>
            </Group>
          </Stack>
        ) : null}
      </Modal>
    </>
  );
}

function LoadingState() {
  return (
    <Box style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
      <Stack gap={14} style={{ flex: "1 1 560px", minWidth: 0 }}>
        <Skeleton height={300} radius={tokens.radius.tile} />
        <Skeleton height={280} radius={tokens.radius.tile} />
      </Stack>
      <Stack gap={12} style={{ flex: "1 1 320px", minWidth: 0, maxWidth: 360 }}>
        <Skeleton height={200} radius={tokens.radius.tile} />
        <Skeleton height={220} radius={tokens.radius.tile} />
        <Skeleton height={200} radius={tokens.radius.tile} />
      </Stack>
    </Box>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Stack align="center" gap={12} py={80}>
      <WarningCircleIcon
        size={36}
        weight="duotone"
        color="rgba(255,255,255,0.5)"
      />
      <Text fz="15px" fw={700} c="gray.0">
        Couldn&rsquo;t load your dashboard
      </Text>
      <Text fz="13px" fw={500} c="rgba(255,255,255,0.6)" ta="center" maw={320}>
        Something went wrong fetching today&rsquo;s focus. Try again.
      </Text>
      <Button
        variant="light"
        color="accent"
        radius="xl"
        leftSection={<ArrowClockwiseIcon size={15} weight="bold" />}
        onClick={onRetry}
      >
        Retry
      </Button>
    </Stack>
  );
}
