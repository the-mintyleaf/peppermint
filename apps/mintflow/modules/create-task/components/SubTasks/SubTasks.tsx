"use client";

import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { Box, Group, Text, UnstyledButton } from "@peppermint/ui";

import { CheckItem, MonoText, SectionLabel } from "@/components";
import { tokens } from "@/config/design";

import type { SubTasksProps } from "./SubTasks.types";

/**
 * The sub-tasks section: a progress-counted header, a bordered card of check
 * rows (each removable), and a dashed "add a sub-task" row that commits on
 * Enter. Empty state = only the add row is shown.
 */
export function SubTasks({
  subs,
  newSub,
  onToggle,
  onRemove,
  onNewSubChange,
  onAdd,
}: SubTasksProps) {
  const done = subs.filter((s) => s.done).length;

  return (
    <Box>
      <Group justify="space-between" align="center" mb={10}>
        <SectionLabel>SUB-TASKS</SectionLabel>
        <MonoText fz="11px" c={tokens.muted}>
          {done}/{subs.length}
        </MonoText>
      </Group>

      <Box
        style={{
          border: `1px solid ${tokens.line}`,
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {subs.map((s, i) => (
          <Box
            key={s.id}
            style={{
              padding: "12px 14px",
              borderTop: i === 0 ? "none" : `1px solid ${tokens.line}`,
            }}
          >
            <CheckItem
              title={s.title}
              done={s.done}
              onToggle={() => onToggle(s.id)}
              ringSize={20}
              ring={tokens.green}
              fill={tokens.green}
              right={
                <UnstyledButton
                  onClick={() => onRemove(s.id)}
                  aria-label={`Remove sub-task: ${s.title}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 22,
                    height: 22,
                    borderRadius: 7,
                  }}
                >
                  <XIcon size={13} color={tokens.muted} />
                </UnstyledButton>
              }
            />
          </Box>
        ))}

        <Group
          gap={14}
          wrap="nowrap"
          align="center"
          style={{
            padding: "12px 14px",
            borderTop: subs.length ? `1px solid ${tokens.line}` : "none",
          }}
        >
          <Box
            style={{
              width: 20,
              height: 20,
              flex: "0 0 auto",
              borderRadius: "50%",
              border: "2px dashed rgba(0,0,0,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PlusIcon size={12} color={tokens.muted} weight="bold" />
          </Box>
          <input
            value={newSub}
            onChange={(e) => onNewSubChange(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAdd();
              }
            }}
            placeholder="Add a sub-task"
            aria-label="Add a sub-task"
            style={{
              flex: 1,
              minWidth: 0,
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 500,
              color: tokens.ink,
            }}
          />
        </Group>
      </Box>

      {subs.length === 0 ? (
        <Text fz="12px" c={tokens.muted} mt={8}>
          No sub-tasks yet — add one above.
        </Text>
      ) : null}
    </Box>
  );
}
