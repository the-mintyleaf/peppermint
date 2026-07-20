"use client";

import Link from "next/link";
import { Button, Group } from "@peppermint/ui";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { UserPlusIcon } from "@phosphor-icons/react/dist/csr/UserPlus";

import type { QuickActionsProps } from "./QuickActions.types";

/**
 * Primary entry points. These are actions (levers) — filled/outline buttons, visually and
 * positionally distinct from the stat tiles below them (DESIGN.md 1.9). Each routes to the
 * surface where the record is created.
 */
export function QuickActions({ isAdmin }: QuickActionsProps) {
  return (
    <Group gap="xs">
      <Button
        component={Link}
        href="/admin/applicants"
        size="xs"
        leftSection={<UserPlusIcon size={14} aria-hidden />}
      >
        New applicant
      </Button>
      {isAdmin ? (
        <Button
          component={Link}
          href="/admin/documents"
          variant="default"
          size="xs"
          leftSection={<FileTextIcon size={14} aria-hidden />}
        >
          New document
        </Button>
      ) : null}
    </Group>
  );
}
