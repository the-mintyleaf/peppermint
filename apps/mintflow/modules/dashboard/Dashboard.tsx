"use client";

import { useState } from "react";
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

import { Screen } from "@/components";
import { tokens } from "@/config/design";
import {
  useDashboard,
  useDashboardBoard,
  useDrawer,
  notConnected,
} from "./Dashboard.hooks";
import type { DashboardVariant } from "./Dashboard.hooks";
import { FocusPanel } from "./components/FocusPanel";
import { TaskFlowBoard } from "./components/TaskFlowBoard";
import { WorkFilesRail } from "./components/WorkFilesRail";
import { AttentionRail } from "./components/AttentionRail";
import { ScheduleRail } from "./components/ScheduleRail";
import { MetricsRail } from "./components/MetricsRail";
import { TaskDrawer } from "./components/TaskDrawer";
import type { FocusTask } from "./module.api";

const GREETING = "Good morning, Minister";
const TODAY = "Wednesday, 16 July";

export function ModuleDashboard() {
  const [variant, setVariant] = useState<DashboardVariant>("populated");
  const { data, isLoading, isError, refetch } = useDashboard(variant);
  const board = useDashboardBoard(data);
  const drawer = useDrawer();

  const onStartFocus = (_task: FocusTask) => {
    void _task;
    notConnected();
  };

  return (
    <Screen fluid>
      <Box p={{ base: 16, sm: 28 }}>
        {/* Page-level anchor (spec §14 — one primary anchor) */}
        <Group
          justify="space-between"
          align="flex-end"
          mb={22}
          wrap="wrap"
          gap="sm"
        >
          <Stack gap={2}>
            <Text fz="12px" fw={600} c="rgba(0,0,0,0.42)" ff="monospace">
              {TODAY}
            </Text>
            <Text
              component="h1"
              fz="24px"
              fw={700}
              c={tokens.ink}
              style={{ letterSpacing: "-0.5px" }}
            >
              {GREETING}
            </Text>
          </Stack>
          <SegmentedControl
            size="xs"
            radius="xl"
            value={variant}
            onChange={(v) => setVariant(v as DashboardVariant)}
            data={[
              { value: "populated", label: "Today" },
              { value: "empty", label: "First run" },
            ]}
            aria-label="Preview populated or first-run dashboard"
          />
        </Group>

        {isLoading ? (
          <LoadingState />
        ) : isError || !data ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (
          <Box
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 20,
              alignItems: "flex-start",
            }}
          >
            {/* Main column — Focus first, then the flow board */}
            <Stack gap={22} style={{ flex: "1 1 560px", minWidth: 0 }}>
              <FocusPanel
                focus={board.focus}
                onToggleDone={board.toggleFocusDone}
                onStart={onStartFocus}
                onChooseFocus={notConnected}
              />
              <TaskFlowBoard
                flowByColumn={board.flowByColumn}
                wipCount={board.wipCount}
                wipFull={board.wipFull}
                onMove={board.moveFlow}
                onOpen={drawer.open}
                onQuickComplete={board.quickComplete}
                onQuickCreate={notConnected}
              />
            </Stack>

            {/* Rail — priority order: work files → attention → schedule → metrics */}
            <Stack
              gap={20}
              style={{ flex: "1 1 320px", minWidth: 0, maxWidth: 380 }}
            >
              <WorkFilesRail
                files={data.workFiles}
                onOpenFile={() => notConnected()}
                onViewAll={notConnected}
              />
              <AttentionRail
                items={data.attention}
                onAction={() => notConnected()}
              />
              <ScheduleRail items={data.schedule} />
              <MetricsRail
                kpis={data.kpis}
                momentum={data.momentum}
                onKpiAction={() => notConnected()}
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
            <Text fz="13px" fw={500} c="rgba(0,0,0,0.6)">
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
    </Screen>
  );
}

function LoadingState() {
  return (
    <Box style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
      <Stack gap={22} style={{ flex: "1 1 560px", minWidth: 0 }}>
        <Skeleton height={220} radius={tokens.radius.tile} />
        <Skeleton height={280} radius={tokens.radius.tile} />
      </Stack>
      <Stack gap={20} style={{ flex: "1 1 320px", minWidth: 0, maxWidth: 380 }}>
        <Skeleton height={160} radius={tokens.radius.tile} />
        <Skeleton height={160} radius={tokens.radius.tile} />
        <Skeleton height={200} radius={tokens.radius.tile} />
      </Stack>
    </Box>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Stack align="center" gap={12} py={80}>
      <WarningCircleIcon size={36} weight="duotone" color={tokens.muted2} />
      <Text fz="15px" fw={700} c={tokens.ink}>
        Couldn&rsquo;t load your dashboard
      </Text>
      <Text fz="13px" fw={500} c="rgba(0,0,0,0.5)" ta="center" maw={320}>
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
