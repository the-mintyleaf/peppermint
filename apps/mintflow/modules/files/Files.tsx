"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import {
  Box,
  Center,
  Group,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
} from "@peppermint/ui";

import { MonoText, Screen } from "@/components";
import { tokens } from "@/config/design";
import { useAppShellStore } from "@/layouts/app-shell";
import { FileRow } from "./components/FileRow";
import { FILES, FILTERS, OPEN_TASKS } from "./Files.data";
import type { FileBand } from "./Files.types";
import classes from "./Files.module.css";

/**
 * Work files screen (`/files`) — the minister's collection of work files with
 * status filtering. Static mock data (no backend); async states are N/A.
 */
export function ModuleFiles() {
  const router = useRouter();
  const openCreateTask = useAppShellStore((s) => s.openCreateTask);
  const [active, setActive] = useState<FileBand | null>(null);

  const visible = active ? FILES.filter((f) => f.band === active) : FILES;

  const handleOpen = (id: string) => router.push(`/files/${id}/trail`);

  return (
    <Screen>
      <Stack gap={20}>
        {/* Header */}
        <Group align="center" justify="space-between" gap={12}>
          <Stack gap={4}>
            <MonoText label fz={10} c={tokens.muted}>
              HOME MINISTRY
            </MonoText>
            <Text fw={700} fz={27} c={tokens.ink} style={{ letterSpacing: -1 }}>
              Work files.
            </Text>
          </Stack>
          <UnstyledButton
            onClick={() => router.push("/ai")}
            aria-label="Ask AI"
            style={{
              width: 38,
              height: 38,
              flex: "0 0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${tokens.lineStrong}`,
              borderRadius: 12,
            }}
          >
            <MagnifyingGlassIcon size={18} color={tokens.ink} />
          </UnstyledButton>
        </Group>

        {/* Summary strip */}
        <Group gap={12} align="center">
          <Group gap={0} align="baseline">
            <MonoText fz={22} fw={700} c={tokens.ink}>
              {FILES.length}
            </MonoText>
            <Text fz={12} fw={500} c={tokens.muted} ml={6}>
              collections
            </Text>
          </Group>
          <Box
            w={1}
            h={20}
            style={{ background: tokens.lineStrong, flex: "0 0 auto" }}
          />
          <Group gap={0} align="baseline">
            <MonoText fz={22} fw={700} c={tokens.accent}>
              {OPEN_TASKS}
            </MonoText>
            <Text fz={12} fw={500} c={tokens.muted} ml={6}>
              open tasks
            </Text>
          </Group>
        </Group>

        {/* Filter chips */}
        <ScrollArea scrollbarSize={0} type="never" offsetScrollbars={false}>
          <Group gap={8} wrap="nowrap">
            {FILTERS.map((filter) => {
              const isActive = filter.band === active;
              return (
                <UnstyledButton
                  key={filter.label}
                  onClick={() => setActive(filter.band)}
                  aria-pressed={isActive}
                  style={{
                    flex: "0 0 auto",
                    padding: "8px 14px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    background: isActive ? tokens.ink : "transparent",
                    color: isActive ? "#fff" : "rgba(0,0,0,0.6)",
                    border: `1px solid ${isActive ? tokens.ink : tokens.lineStrong}`,
                  }}
                >
                  {filter.label}
                </UnstyledButton>
              );
            })}
          </Group>
        </ScrollArea>

        {/* File list / empty state */}
        {visible.length > 0 ? (
          <Box>
            {visible.map((file) => (
              <FileRow key={file.id} file={file} onOpen={handleOpen} />
            ))}
          </Box>
        ) : (
          <Center style={{ padding: "70px 0" }}>
            <Text fz={14} c={tokens.muted}>
              No collections in this view.
            </Text>
          </Center>
        )}
      </Stack>

      {/* FAB — opens the Create Task sheet */}
      <UnstyledButton
        className={classes.fab}
        onClick={openCreateTask}
        aria-label="New work"
      >
        <PlusIcon size={16} weight="bold" color="#fff" />
        New work
      </UnstyledButton>
    </Screen>
  );
}
