"use client";

import { Avatar, Box, Button, Group, Stack, Text } from "@peppermint/ui";
import { TargetIcon } from "@phosphor-icons/react/dist/csr/Target";

import { tokens } from "@/config/design";
import { FOCUS_LIMIT, LAVENDER } from "../../module.api";
import { FocusPill } from "./components/FocusPill";
import { FocusStat } from "./components/FocusStat";
import type { FocusHeroProps } from "./FocusHero.types";

const NUM_WORD = ["None", "One", "Two", "Three"];

function inFocusPhrase(total: number): string {
  return `${NUM_WORD[total] ?? total} in focus.`;
}

function Divider() {
  return (
    <Box w={1} style={{ alignSelf: "stretch", background: tokens.line }} />
  );
}

export function FocusHero({
  greetingName,
  today,
  focus,
  team,
  doneThisWeek,
  onHoldNow,
  onToggleDone,
  onContinue,
  onChooseFocus,
  previewControl,
}: FocusHeroProps) {
  const tasks = focus.slice(0, FOCUS_LIMIT);
  const total = tasks.length;
  const done = tasks.filter((t) => t.state === "done").length;

  // The single emphasised pill: the overdue one, else the first unfinished.
  const highlightId =
    tasks.find((t) => t.state !== "done" && t.overdue)?.id ??
    tasks.find((t) => t.state !== "done")?.id ??
    null;

  const shownTeam = team.slice(0, 3);
  const extra = team.length - shownTeam.length;

  return (
    <Box
      style={{
        background: tokens.paper,
        border: `1px solid ${tokens.line}`,
        borderRadius: tokens.radius.tile,
        overflow: "hidden",
        boxShadow: tokens.shadow.card,
      }}
    >
      {/* Header — greeting, preview control, team */}
      <Box
        style={{
          padding: "24px 26px",
          borderBottom: `1px solid ${tokens.line}`,
        }}
      >
        <Group
          justify="space-between"
          align="flex-start"
          wrap="nowrap"
          gap="lg"
        >
          <Stack gap={8} style={{ minWidth: 0 }}>
            <Text fz="12px" fw={600} c={tokens.muted2}>
              {today} · Today&rsquo;s commitment
            </Text>
            <Text
              component="h1"
              fw={700}
              c={tokens.ink}
              style={{
                fontSize: 28,
                lineHeight: 1.05,
                letterSpacing: "-0.5px",
              }}
            >
              Good morning, {greetingName}.{" "}
              <Text component="span" inherit c={tokens.accent}>
                {inFocusPhrase(total)}
              </Text>
            </Text>
          </Stack>

          <Group
            gap={12}
            wrap="nowrap"
            align="center"
            style={{ flex: "0 0 auto" }}
          >
            {previewControl}
            {shownTeam.length > 0 ? (
              <Avatar.Group spacing="sm">
                {shownTeam.map((p) => (
                  <Avatar
                    key={p.initials}
                    size={32}
                    radius="xl"
                    color={p.color}
                  >
                    {p.initials}
                  </Avatar>
                ))}
                {extra > 0 ? (
                  <Avatar size={32} radius="xl" color="gray">
                    +{extra}
                  </Avatar>
                ) : null}
              </Avatar.Group>
            ) : null}
          </Group>
        </Group>

        {/* Big-number readout row */}
        <Group gap={38} wrap="wrap" mt={22} align="stretch">
          <FocusStat
            value={
              <>
                {done}
                <Text component="span" inherit c={tokens.muted}>
                  /{total || FOCUS_LIMIT}
                </Text>
              </>
            }
            label="Focus done today"
          />
          <Divider />
          <FocusStat value={doneThisWeek} label="Done this week" />
          <Divider />
          <FocusStat value={onHoldNow} label="On hold now" color={LAVENDER} />
        </Group>
      </Box>

      {/* Body — pills or empty state */}
      <Box style={{ padding: total > 0 ? "16px 20px 20px" : "24px 20px" }}>
        {total > 0 ? (
          <Stack gap={10}>
            {tasks.map((task) => (
              <FocusPill
                key={task.id}
                task={task}
                highlighted={task.id === highlightId}
                onToggleDone={onToggleDone}
                onContinue={onContinue}
              />
            ))}
            <Text ff="monospace" fz="11.5px" c={tokens.muted2} px={4}>
              {done} of {total} done today
            </Text>
          </Stack>
        ) : (
          <Stack align="center" gap={14} py={16}>
            <Box
              w={54}
              h={54}
              style={{
                borderRadius: 16,
                background: tokens.accentSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TargetIcon size={26} color={tokens.accent} weight="duotone" />
            </Box>
            <Stack align="center" gap={4}>
              <Text fz="15px" fw={700} c={tokens.ink}>
                No focus set for today
              </Text>
              <Text fz="13px" fw={500} c={tokens.muted2} ta="center" maw={320}>
                Pick up to three tasks to commit to. Yesterday&rsquo;s
                unfinished focus will resurface as suggestions.
              </Text>
            </Stack>
            <Button
              color="accent"
              radius="xl"
              leftSection={<TargetIcon size={15} weight="bold" />}
              onClick={onChooseFocus}
            >
              Choose focus tasks
            </Button>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
