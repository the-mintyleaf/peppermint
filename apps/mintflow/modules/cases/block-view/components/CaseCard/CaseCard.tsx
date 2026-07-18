"use client";

import {
  Avatar,
  Box,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
} from "@peppermint/ui";
import { FlagIcon } from "@phosphor-icons/react/dist/csr/Flag";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { EyeSlashIcon } from "@phosphor-icons/react/dist/csr/EyeSlash";

import {
  actorInitials,
  actorLabel,
  avatarColorForId,
  formatDatePair,
  resolveTitle,
  unitLabel,
  WORK_PRIORITY_LABEL,
  WORK_STATUS_LABEL,
} from "@/lib/work";
import { MonoText, StatusPill } from "@/components";
import { tokens } from "@/config/design";
import { PRIORITY_STYLE, STATUS_STYLE } from "../../../cases.styles";
import type { CaseCardProps } from "./CaseCard.types";

export function CaseCard({
  workCase,
  onOpen,
  actorDir,
  unitDir,
}: CaseCardProps) {
  const status = STATUS_STYLE[workCase.status];
  const priority = PRIORITY_STYLE[workCase.priority];
  const title = resolveTitle(workCase);
  const ownerName = actorLabel(workCase.current_owner, actorDir);
  const ownerInitials = actorInitials(workCase.current_owner, actorDir);
  const unit = unitLabel(workCase.responsible_unit, unitDir);
  const due = formatDatePair(workCase.due_at, workCase.due_at_bs);
  const restricted = workCase.visibility_mode !== "organizational";

  return (
    <Paper
      radius={tokens.radius.card}
      p="lg"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(workCase)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(workCase);
        }
      }}
      style={{
        cursor: "pointer",
        height: "100%",
        background: `linear-gradient(${status.cardTint}, ${status.cardTint}), ${tokens.paper}`,
        border: `1px solid ${tokens.line}`,
      }}
    >
      {/* Row 1: reference number · due date */}
      <Group justify="space-between" align="center" wrap="nowrap">
        <MonoText fz="11px" c={tokens.muted} fw={600}>
          {workCase.reference_number}
        </MonoText>
        <Group gap={5} wrap="nowrap" align="center">
          <CalendarBlankIcon size={13} color={tokens.muted} />
          <MonoText fz="11px" c={tokens.muted}>
            {due || "No deadline"}
          </MonoText>
        </Group>
      </Group>

      {/* Priority + flags */}
      <Group gap={8} mt="sm" wrap="nowrap">
        <StatusPill fg={priority.fg} bg={priority.bg} fz="11px" px={10} py={5}>
          <FlagIcon size={12} weight="fill" color={priority.fg} />
          {WORK_PRIORITY_LABEL[workCase.priority]}
        </StatusPill>
        {restricted && (
          <StatusPill
            border={tokens.lineStrong}
            bg="transparent"
            fg={tokens.muted2}
            fz="11px"
          >
            <EyeSlashIcon size={11} color={tokens.muted} />
            Restricted
          </StatusPill>
        )}
      </Group>

      {/* Identity */}
      <Text
        fw={700}
        fz="15px"
        mt="sm"
        lineClamp={2}
        style={{ lineHeight: 1.3 }}
      >
        {title}
      </Text>
      <Text
        c={tokens.muted2}
        fz="xs"
        mt={6}
        lineClamp={2}
        style={{ lineHeight: 1.5 }}
      >
        {workCase.objective}
      </Text>

      {/* Responsible unit */}
      <Group gap={8} mt="md" wrap="nowrap" style={{ overflow: "hidden" }}>
        <StatusPill
          border={tokens.lineStrong}
          bg="transparent"
          fg={tokens.muted2}
          fz="11px"
        >
          <BuildingsIcon size={11} color={tokens.muted} />
          {unit}
        </StatusPill>
      </Group>

      <Divider variant="dashed" color={tokens.line} my="md" />

      {/* Footer: accountable owner + status */}
      <Group justify="space-between" align="center" wrap="nowrap">
        <Group gap={10} wrap="nowrap" style={{ minWidth: 0 }}>
          <Avatar
            size={32}
            radius="xl"
            color={avatarColorForId(workCase.current_owner)}
          >
            {ownerInitials}
          </Avatar>
          <Stack gap={4} style={{ minWidth: 0 }}>
            <Text fw={600} fz="sm" lineClamp={1}>
              {ownerName}
            </Text>
            <StatusPill fg={status.fg} bg={status.bg} dot fz="10px">
              {WORK_STATUS_LABEL[workCase.status]}
            </StatusPill>
          </Stack>
        </Group>

        {workCase.review_required && (
          <Box ta="right">
            <MonoText fz="10px" c={tokens.muted}>
              Review req.
            </MonoText>
          </Box>
        )}
      </Group>
    </Paper>
  );
}
