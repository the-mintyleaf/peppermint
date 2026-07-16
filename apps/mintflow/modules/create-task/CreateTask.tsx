"use client";

import { useState } from "react";

import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { FlagIcon } from "@phosphor-icons/react/dist/csr/Flag";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { TagIcon } from "@phosphor-icons/react/dist/csr/Tag";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { Box, Group, Text, Textarea, UnstyledButton } from "@peppermint/ui";

import { MonoText, SectionLabel, StatusPill } from "@/components";
import { tokens } from "@/config/design";

import { PickerField, PropertyRow, SubTasks } from "./components";
import {
  DEFAULT_PRIORITY,
  DEFAULT_STATUS,
  priorityOptions,
  SEED_NEXT_ID,
  seedSubs,
  statusOptions,
} from "./CreateTask.data";
import type { CreateTaskProps, PickerKind, SubTask } from "./CreateTask.types";

/**
 * Create Task — the inner content of the app-shell's bottom Drawer. Renders a
 * full-height flex column (drag handle → header → scrollable body → floating CTA)
 * on the host's warm-paper surface. Plain controlled form, local state only.
 * Async states are N/A (mock create — no backend).
 */
export function ModuleCreateTask({ onClose }: CreateTaskProps) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState(DEFAULT_STATUS);
  const [priority, setPriority] = useState(DEFAULT_PRIORITY);
  const [picker, setPicker] = useState<PickerKind | null>(null);
  const [newSub, setNewSub] = useState("");
  const [subs, setSubs] = useState<SubTask[]>(seedSubs);
  const [nextId, setNextId] = useState(SEED_NEXT_ID);

  const togglePicker = (kind: PickerKind) =>
    setPicker((prev) => (prev === kind ? null : kind));

  const selectStatus = (key: string) => {
    setStatus(key);
    setPicker(null);
  };

  const selectPriority = (key: string) => {
    setPriority(key);
    setPicker(null);
  };

  const toggleSub = (id: number) =>
    setSubs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s)),
    );

  const removeSub = (id: number) =>
    setSubs((prev) => prev.filter((s) => s.id !== id));

  const addSub = () => {
    const subTitle = newSub.trim();
    if (!subTitle) return;
    setSubs((prev) => [...prev, { id: nextId, title: subTitle, done: false }]);
    setNextId((n) => n + 1);
    setNewSub("");
  };

  return (
    <Box
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        background: tokens.paper,
      }}
    >
      {/* Drag handle */}
      <Box
        aria-hidden
        style={{
          width: 38,
          height: 4,
          borderRadius: 999,
          background: "rgba(0,0,0,0.14)",
          margin: "10px auto 0",
          flex: "0 0 auto",
        }}
      />

      {/* Header */}
      <Group
        px={22}
        py={14}
        gap={12}
        wrap="nowrap"
        align="center"
        style={{ flex: "0 0 auto" }}
      >
        <UnstyledButton
          onClick={onClose}
          aria-label="Close"
          style={{
            width: 34,
            height: 34,
            flex: "0 0 auto",
            borderRadius: 10,
            background: "rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <XIcon size={16} color={tokens.ink} />
        </UnstyledButton>

        <MonoText label fz="11px" c={tokens.muted} style={{ flex: 1 }}>
          NEW TASK
        </MonoText>

        <UnstyledButton
          onClick={onClose}
          style={{
            height: 34,
            flex: "0 0 auto",
            borderRadius: 11,
            background: tokens.ink,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0 14px",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Create
          <ArrowRightIcon size={14} weight="bold" color="#fff" />
        </UnstyledButton>
      </Group>

      {/* Scrollable body */}
      <Box style={{ flex: 1, overflowY: "auto", padding: "6px 22px 130px" }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          placeholder="Untitled task"
          aria-label="Task title"
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: "inherit",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.8px",
            color: tokens.ink,
            padding: "8px 0 6px",
          }}
        />

        <PickerField
          icon={<ClockIcon size={15} color={tokens.muted} />}
          label="Status"
          options={statusOptions}
          value={status}
          open={picker === "status"}
          chipDot
          onToggle={() => togglePicker("status")}
          onSelect={selectStatus}
        />

        <PickerField
          icon={<FlagIcon size={15} color={tokens.muted} />}
          label="Priority"
          options={priorityOptions}
          value={priority}
          open={picker === "priority"}
          onToggle={() => togglePicker("priority")}
          onSelect={selectPriority}
        />

        <PropertyRow
          icon={<UserIcon size={15} color={tokens.muted} />}
          label="Assignee"
        >
          <Group gap={9} wrap="nowrap" align="center">
            <Box
              aria-hidden
              style={{
                width: 24,
                height: 24,
                flex: "0 0 auto",
                borderRadius: "50%",
                background: tokens.blueInk,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              SG
            </Box>
            <Text fz={13} fw={600} c={tokens.ink}>
              Sudhan Gurung
            </Text>
          </Group>
        </PropertyRow>

        <PropertyRow
          icon={<CalendarBlankIcon size={15} color={tokens.muted} />}
          label="Due date"
        >
          <MonoText fz="13px" fw={600} c={tokens.ink}>
            31 Mar · 4:00 PM
          </MonoText>
        </PropertyRow>

        <PropertyRow
          icon={<TagIcon size={15} color={tokens.muted} />}
          label="Category"
        >
          <StatusPill
            fg="rgb(205,66,26)"
            bg="rgba(238,87,41,0.1)"
            fz="12px"
            radius={8}
            px={11}
            py={6}
          >
            Press
          </StatusPill>
        </PropertyRow>

        {/* Description */}
        <Box mt={22}>
          <SectionLabel mb={8}>DESCRIPTION</SectionLabel>
          <Textarea
            variant="unstyled"
            autosize
            minRows={2}
            placeholder="Add context, links, and expectations…"
            value={desc}
            onChange={(e) => setDesc(e.currentTarget.value)}
            aria-label="Task description"
            styles={{
              input: {
                padding: 0,
                fontSize: 14,
                fontWeight: 500,
                color: tokens.ink,
              },
            }}
          />
        </Box>

        {/* Sub-tasks */}
        <Box mt={22}>
          <SubTasks
            subs={subs}
            newSub={newSub}
            onToggle={toggleSub}
            onRemove={removeSub}
            onNewSubChange={setNewSub}
            onAdd={addSub}
          />
        </Box>
      </Box>

      {/* Floating CTA */}
      <Box
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "14px 22px 30px",
          background:
            "linear-gradient(to top, rgb(252,251,249) 60%, rgba(252,251,249,0) 100%)",
        }}
      >
        <UnstyledButton
          onClick={onClose}
          style={{
            width: "100%",
            height: 54,
            borderRadius: 16,
            background: tokens.accent,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontSize: 15,
            fontWeight: 600,
            boxShadow: "0 12px 26px rgba(238,87,41,0.35)",
          }}
        >
          <PlusIcon size={18} weight="bold" color="#fff" />
          Create task
        </UnstyledButton>
      </Box>
    </Box>
  );
}
