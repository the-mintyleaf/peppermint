"use client";

import type { ReactNode } from "react";

import { Box, Button, Group, Stack, Text } from "@peppermint/ui";
import { TargetIcon } from "@phosphor-icons/react/dist/csr/Target";

import { tokens } from "@/config/design";
import { FOCUS_LIMIT, LAVENDER } from "../../module.api";
import { FocusPill } from "./components/FocusPill";
import type { FocusHeroProps } from "./FocusHero.types";

const NUM_WORD = ["None", "One", "Two", "Three"];

function inFocusPhrase(total: number): string {
  return `${NUM_WORD[total] ?? total} in focus.`;
}

function StatDivider() {
  return <Box w={1} h={26} style={{ background: tokens.line }} />;
}

/** Small readout that sits inline beside the greeting — number over label. */
function HeroStat({
  value,
  label,
  color = tokens.ink,
}: {
  value: ReactNode;
  label: string;
  color?: string;
}) {
  return (
    <Box>
      <Text
        ff="monospace"
        fw={700}
        c={color}
        style={{ fontSize: 20, lineHeight: 1, letterSpacing: "-0.4px" }}
      >
        {value}
      </Text>
      <Text
        fz="10px"
        fw={600}
        c={tokens.muted}
        mt={4}
        style={{
          letterSpacing: "0.4px",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Text>
    </Box>
  );
}

export function FocusHero({
  greeting,
  greetingName,
  today,
  focus,
  doneThisWeek,
  onHoldNow,
  onToggleDone,
  onContinue,
  onSetState,
  onChooseFocus,
}: FocusHeroProps) {
  const tasks = focus.slice(0, FOCUS_LIMIT);
  const total = tasks.length;
  const done = tasks.filter((t) => t.state === "done").length;

  return (
    <Box
      style={{
        background:
          "linear-gradient(180deg, rgba(238,87,41,0.09) 0%, rgba(238,87,41,0.035) 100%)",
      }}
    >
      {/* Header — greeting on the left, compact stats inline on the right */}
      <Box
        style={{
          padding: "24px 26px",
          borderBottom: `1px solid ${tokens.line}`,
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="lg">
          <Stack gap={8} style={{ minWidth: 0 }}>
            <Group gap={8} align="center" wrap="nowrap">
              <Text
                fz="11px"
                fw={700}
                c={tokens.accent}
                style={{ letterSpacing: "1.2px", textTransform: "uppercase" }}
              >
                Today&rsquo;s Focus
              </Text>
              <Text fz="11px" fw={500} c={tokens.muted}>
                · {today}
              </Text>
            </Group>
            <Text
              component="h1"
              fw={700}
              c={tokens.ink}
              style={{
                fontSize: 31,
                lineHeight: 1.05,
                letterSpacing: "-0.5px",
              }}
            >
              {greeting}, {greetingName}.{" "}
              <Text component="span" inherit c={tokens.accent}>
                {inFocusPhrase(total)}
              </Text>
            </Text>
          </Stack>

          <Group
            gap={16}
            wrap="nowrap"
            align="center"
            style={{ flex: "0 0 auto" }}
          >
            <HeroStat
              value={
                <>
                  {done}
                  <Text component="span" inherit c={tokens.muted}>
                    /{total || FOCUS_LIMIT}
                  </Text>
                </>
              }
              label="Done today"
            />
            <StatDivider />
            <HeroStat value={doneThisWeek} label="This week" />
            <StatDivider />
            <HeroStat value={onHoldNow} label="On hold" color={LAVENDER} />
          </Group>
        </Group>
      </Box>

      {/* Body — uniform pills or empty state */}
      <Box style={{ padding: total > 0 ? "16px 20px 20px" : "24px 20px" }}>
        {total > 0 ? (
          <Stack gap={8}>
            {tasks.map((task) => (
              <FocusPill
                key={task.id}
                task={task}
                onToggleDone={onToggleDone}
                onContinue={onContinue}
                onSetState={onSetState}
              />
            ))}
            <Text ff="monospace" fz="11.5px" c={tokens.muted2} px={4} mt={2}>
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
