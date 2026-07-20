"use client";

import {
  Avatar,
  Badge,
  Group,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@peppermint/ui";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import {
  LIFECYCLE_STAGE_COLORS,
  LIFECYCLE_STAGE_LABELS,
} from "@/modules/admin/applicant/_shared";

import type { StudentCardProps } from "../../NewDocumentModal.types";
import classes from "./StudentCard.module.css";

/** Initials for the avatar fallback (first + last visible word of the name). */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function contactLine(student: StudentCardProps["student"]): string | null {
  return student.primary_email || student.primary_phone || null;
}

/**
 * One selectable student in the New Document picker. A plain toggle button (not an
 * ARIA radio — there's no roving-tabindex/arrow-key behaviour here), so each card is
 * a normal tab stop activated with Enter/Space; `aria-pressed` announces the pick.
 * The selected card carries a coloured border, tint, and a check badge — colour is
 * never the only signal.
 */
export function StudentCard({ student, selected, onSelect }: StudentCardProps) {
  const contact = contactLine(student);

  return (
    <UnstyledButton
      className={classes.card}
      data-selected={selected || undefined}
      aria-pressed={selected}
      aria-label={`Select ${student.full_name}`}
      onClick={() => onSelect(student)}
    >
      <Group gap="sm" wrap="nowrap" align="center">
        {/*
          No `src`: neither list projection returns `profile_image_url` (it is on the
          detail record only), so this always fell through to initials anyway. Asking
          for the picture here would mean a detail fetch per row.
        */}
        <Avatar radius="xl" size={40} color="brand">
          {initials(student.full_name)}
        </Avatar>

        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs" wrap="nowrap" justify="space-between">
            <Text size="sm" fw={600} truncate>
              {student.full_name}
            </Text>
            <Badge
              size="xs"
              variant="light"
              color={LIFECYCLE_STAGE_COLORS[student.lifecycle_stage]}
            >
              {LIFECYCLE_STAGE_LABELS[student.lifecycle_stage]}
            </Badge>
          </Group>
          <Text size="xs" c="dimmed" truncate>
            {student.applicant_code}
            {contact ? ` · ${contact}` : ""}
          </Text>
        </Stack>

        <ThemeIcon
          className={classes.check}
          size={22}
          radius="xl"
          variant="filled"
          color="brand"
          aria-hidden
        >
          <CheckIcon size={13} weight="bold" />
        </ThemeIcon>
      </Group>
    </UnstyledButton>
  );
}
