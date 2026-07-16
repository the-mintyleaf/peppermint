"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  ActionIcon,
  Avatar,
  Box,
  Group,
  Stack,
  Text,
  UnstyledButton,
} from "@peppermint/ui";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";

import { tokens } from "@/config/design";
import { MonoText, Screen } from "@/components";

import { tasks } from "./Tasks.data";
import type { TaskTab } from "./Tasks.types";
import { TaskCard } from "./components/TaskCard";

const TABS: TaskTab[] = ["All", "Ongoing", "On-Next", "Complete"];

function countFor(tab: TaskTab): number {
  return tab === "All"
    ? tasks.length
    : tasks.filter((t) => t.status === tab).length;
}

/**
 * All-tasks screen: filterable list of ministry tasks.
 * Data is a static mock (not backend-wired) — async/loading/error/permission
 * states are N/A; the empty state is handled per filter below.
 */
export function ModuleTasks() {
  const router = useRouter();
  const [active, setActive] = useState<TaskTab>("All");

  const filtered =
    active === "All" ? tasks : tasks.filter((t) => t.status === active);

  return (
    <Screen>
      <Stack gap={0}>
        <Group align="center" gap={12}>
          <Text fz={15} style={{ letterSpacing: "-0.3px" }}>
            <b>kam</b>ban.
          </Text>
          <ActionIcon
            ml="auto"
            variant="subtle"
            color="dark"
            radius="xl"
            aria-label="Ask AI"
            onClick={() => router.push("/ai")}
          >
            <MagnifyingGlassIcon size={18} aria-hidden="true" />
          </ActionIcon>
          <Avatar size={30} radius="xl" />
        </Group>

        <Stack gap={2} mt={10}>
          <MonoText label fz={11} c={tokens.muted}>
            HOME MINISTRY
          </MonoText>
          <Text fz={27} fw={700} style={{ letterSpacing: "-1px" }}>
            All tasks.
          </Text>
        </Stack>

        <Group
          gap={0}
          mt={14}
          wrap="nowrap"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
        >
          {TABS.map((tab) => {
            const isActive = tab === active;
            return (
              <UnstyledButton
                key={tab}
                onClick={() => setActive(tab)}
                style={{
                  position: "relative",
                  padding: "10px 10px 13px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: isActive ? tokens.ink : "rgba(0,0,0,0.45)",
                }}
              >
                <Group gap={6} align="center" wrap="nowrap">
                  {tab}
                  <MonoText
                    span
                    fz={10}
                    fw={600}
                    style={{
                      padding: "2px 6px",
                      borderRadius: 20,
                      background: isActive
                        ? "rgba(238,87,41,0.12)"
                        : "rgba(0,0,0,0.05)",
                      color: isActive ? tokens.accentDark : "rgba(0,0,0,0.45)",
                    }}
                  >
                    {countFor(tab)}
                  </MonoText>
                </Group>
                <Box
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 2,
                    background: isActive ? tokens.accent : "transparent",
                  }}
                />
              </UnstyledButton>
            );
          })}
        </Group>

        {filtered.length === 0 ? (
          <Text
            ta="center"
            fz={13}
            fw={500}
            c={tokens.muted}
            style={{ padding: "70px 0" }}
          >
            Nothing in this view.
          </Text>
        ) : (
          <Stack gap={0}>
            {filtered.map((task, i) => (
              <TaskCard key={`${task.title}-${i}`} task={task} />
            ))}
          </Stack>
        )}
      </Stack>
    </Screen>
  );
}
