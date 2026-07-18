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
    <Group gap="sm">
      <Button
        component={Link}
        href="/admin/applicants"
        leftSection={<UserPlusIcon size={18} aria-hidden />}
      >
        New applicant
      </Button>
      {isAdmin ? (
        <Button
          component={Link}
          href="/admin/documents"
          variant="default"
          leftSection={<FileTextIcon size={18} aria-hidden />}
        >
          New document
        </Button>
      ) : null}
    </Group>
  );
}
