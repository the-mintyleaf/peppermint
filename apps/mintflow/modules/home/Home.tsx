"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Box, Group, Stack, Text, UnstyledButton } from "@peppermint/ui";

import { CheckItem, MonoText, Screen, SectionLabel } from "@/components";
import { tokens } from "@/config/design";

import { FocusCard, HomeHeader, HomeNavRow } from "./components";
import { focusTask, homeNavRows, homeTasks } from "./Home.data";

// Async states are N/A — this is a static mock screen. The task list is always
// populated (no loading / empty / error / permission states to render); the
// only interactive state is local check-ring completion.
export function ModuleHome() {
  const router = useRouter();
  const [done, setDone] = useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <Screen>
      <HomeHeader />

      <Text
        mt={22}
        fz="27px"
        fw={700}
        style={{ letterSpacing: "-1px", lineHeight: 1.05, maxWidth: 300 }}
      >
        Here’s a breakdown of your work for today.
      </Text>

      <Group mt={20} gap={16} wrap="wrap" align="center">
        <MonoText label fz="10px" fw={700}>
          ON-NEXT
        </MonoText>
        <Group gap={6} align="center" wrap="nowrap">
          <Box style={dotStyle(tokens.blue)} aria-hidden />
          <Text fz="11px" fw={500}>
            3 Complete
          </Text>
        </Group>
        <Group gap={6} align="center" wrap="nowrap">
          <Box style={dotStyle(tokens.greenSoft)} aria-hidden />
          <Text fz="11px" fw={500}>
            4 Remaining
          </Text>
        </Group>
      </Group>

      <SectionLabel mt={24}>FOCUS NOW</SectionLabel>

      <Box mt={12}>
        <FocusCard task={focusTask} onOpen={() => router.push("/tasks")} />
      </Box>

      <Box
        style={{ borderTop: `1px solid ${tokens.line}`, margin: "26px 0" }}
      />

      <Group justify="space-between" align="center">
        <Text fz="20px" fw={700} style={{ letterSpacing: "-0.5px" }}>
          Tasks
        </Text>
        <UnstyledButton
          onClick={() => router.push("/tasks")}
          aria-label="View all tasks"
        >
          <Text fz="12px" fw={600} c={tokens.blueInk}>
            View all
          </Text>
        </UnstyledButton>
      </Group>

      <Box
        mt={12}
        style={{
          background: "rgba(10,12,14,0.035)",
          border: "1px solid rgba(0,0,0,0.05)",
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        {homeTasks.map((task, idx) => (
          <Box
            key={task.id}
            style={{
              padding: "16px 18px",
              borderTop: idx === 0 ? undefined : "1px solid rgba(0,0,0,0.07)",
            }}
          >
            <CheckItem
              title={task.title}
              subtitle={task.category}
              done={Boolean(done[task.id])}
              onToggle={() => toggle(task.id)}
              ring={idx === 0 ? tokens.accent : undefined}
              fill={tokens.accent}
              ringSize={24}
              align="center"
            />
          </Box>
        ))}
      </Box>

      <Stack gap={0} mt={6}>
        {homeNavRows.map((row) => (
          <HomeNavRow key={row.id} label={row.label} icon={row.icon} />
        ))}
      </Stack>
    </Screen>
  );
}

/** 8px status dot used in the legend row. */
function dotStyle(color: string): React.CSSProperties {
  return { width: 8, height: 8, borderRadius: "50%", background: color };
}
