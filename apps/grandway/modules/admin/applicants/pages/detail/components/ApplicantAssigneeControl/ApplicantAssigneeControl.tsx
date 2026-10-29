"use client";

import {
  Box,
  Button,
  Group,
  Menu,
  Text,
  Tooltip,
  VisuallyHidden,
} from "@peppermint/ui";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { UserCircleIcon } from "@phosphor-icons/react/dist/csr/UserCircle";
import { UserCirclePlusIcon } from "@phosphor-icons/react/dist/csr/UserCirclePlus";
import { UserMinusIcon } from "@phosphor-icons/react/dist/csr/UserMinus";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { useApplicantAuthority } from "../../../../applicants.access";
import {
  useAssignApplicant,
  useAssignableStaff,
} from "../../../../applicants.hooks";
import { userBriefLabel } from "../../../../applicants.labels";
import type {
  AdminAssigneeMenuProps,
  ApplicantAssigneeControlProps,
  AssigneeFactProps,
  SelfAssignButtonProps,
} from "./ApplicantAssigneeControl.types";

/** The read-only half: who holds the file, as a quiet fact with its reason. */
function AssigneeFact({ label, reason }: AssigneeFactProps) {
  const fact = (
    <Group gap={6} wrap="nowrap">
      <UserCircleIcon size={16} aria-hidden />
      <Text size="xs" c="dimmed">
        Assigned to{" "}
        <Text span size="xs" fw={600} c="var(--mantine-color-text)">
          {label}
        </Text>
        {reason ? <VisuallyHidden>. {reason}</VisuallyHidden> : null}
      </Text>
    </Group>
  );
  if (!reason) return fact;
  return (
    <Tooltip label={reason} withArrow multiline maw={260}>
      {/* Focusable so a keyboard user can open the same explanation. */}
      <Box component="span" tabIndex={0} style={{ display: "inline-flex" }}>
        {fact}
      </Box>
    </Tooltip>
  );
}

/**
 * Admin: pick anyone the account list shows, take it yourself, or clear it.
 *
 * The list is `GET /auth/users/`, which shows an Admin the Lead Managers only —
 * no endpoint lists fellow Admins (INTEGRATION.md §9). Said in the menu, in one
 * line, because otherwise "why isn't Sita here?" has no answer. A fellow Admin
 * already holding the file still shows as the checked current value.
 */
function AdminAssigneeMenu({
  applicantId,
  assignee,
  myId,
  label,
}: AdminAssigneeMenuProps) {
  const mutation = useAssignApplicant(applicantId);
  const staff = useAssignableStaff(true);
  const people = (staff.data ?? []).filter((person) => person.id !== myId);
  const holderListed =
    !assignee ||
    assignee.id === myId ||
    people.some((person) => person.id === assignee.id);

  const assign = (id: string | null) => {
    if ((assignee?.id ?? null) === id) return;
    mutation.mutate({ assigned_to: id });
  };
  const check = (id: string) =>
    assignee?.id === id ? <CheckIcon size={14} aria-label="Current" /> : null;

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <Button
          size="xs"
          variant="default"
          loading={mutation.isPending}
          leftSection={<UserCircleIcon size={14} aria-hidden />}
          rightSection={<CaretDownIcon size={12} aria-hidden />}
          aria-label={`Assigned to ${label}. Change assignment`}
        >
          {assignee ? `Assigned: ${label}` : "Unassigned"}
        </Button>
      </Menu.Target>
      <Menu.Dropdown miw={240}>
        <Menu.Label>Assign to</Menu.Label>
        <Menu.Item rightSection={check(myId)} onClick={() => assign(myId)}>
          Me
        </Menu.Item>
        {assignee && !holderListed ? (
          <Menu.Item rightSection={check(assignee.id)} disabled>
            {userBriefLabel(assignee)}
          </Menu.Item>
        ) : null}
        {staff.isLoading ? (
          <Menu.Item disabled>Loading people…</Menu.Item>
        ) : null}
        {staff.isError ? (
          <Menu.Item
            color="red"
            closeMenuOnClick={false}
            onClick={() => void staff.refetch()}
          >
            Couldn&apos;t load people — retry
          </Menu.Item>
        ) : null}
        {people.map((person) => (
          <Menu.Item
            key={person.id}
            rightSection={check(person.id)}
            onClick={() => assign(person.id)}
          >
            {person.display_name.trim() || person.username}
          </Menu.Item>
        ))}
        {assignee ? (
          <>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<UserMinusIcon size={14} aria-hidden />}
              onClick={() => assign(null)}
            >
              Clear assignment
            </Menu.Item>
          </>
        ) : null}
        <Menu.Divider />
        <Text size="xs" c="dimmed" px="sm" py={4} maw={260}>
          Lists Lead Managers. Another Admin can assign this file to themselves
          with “Me”.
        </Text>
      </Menu.Dropdown>
    </Menu>
  );
}

/**
 * Lead Manager: Take an unassigned file, or Release their own — the only two
 * moves the backend allows them (`APPLICANTS_ASSIGNMENT_FORBIDDEN` otherwise).
 */
function SelfAssignButton({ applicantId, myId, mode }: SelfAssignButtonProps) {
  const mutation = useAssignApplicant(applicantId);
  const take = mode === "take";
  return (
    <Button
      size="xs"
      variant={take ? "light" : "subtle"}
      color={take ? undefined : "gray"}
      loading={mutation.isPending}
      leftSection={
        take ? (
          <UserCirclePlusIcon size={14} aria-hidden />
        ) : (
          <UserMinusIcon size={14} aria-hidden />
        )
      }
      onClick={() => mutation.mutate({ assigned_to: take ? myId : null })}
    >
      {take ? "Take" : "Release"}
    </Button>
  );
}

/**
 * The "Assigned to" control in the applicant file header. **Routing only** —
 * the assignee is who receives this file's alerts; everyone keeps full access
 * either way, so nothing here reads as a permission.
 *
 * - **Admin** → a picker: Me, each Lead Manager, Clear.
 * - **Lead Manager** → "Take" when nobody holds it, "Release" when they do;
 *   someone else's file is a plain fact ("only an Admin can reassign").
 * - **Archived** → a fact for everyone: assignment is frozen until restore.
 * - **`/me` still loading** → the fact, never a lever that can't send an id.
 */
export function ApplicantAssigneeControl({
  applicant,
}: ApplicantAssigneeControlProps) {
  const authority = useApplicantAuthority();
  const { user } = useCurrentUser();
  const assignee = applicant.assigned_to;
  const myId = user?.id ?? null;
  const isMine = Boolean(assignee && myId && assignee.id === myId);
  const label = assignee
    ? isMine
      ? "You"
      : userBriefLabel(assignee)
    : "nobody";

  if (applicant.status === "archived") {
    return (
      <AssigneeFact
        label={label}
        reason="Archived files can't be assigned. Restore the applicant first."
      />
    );
  }
  if (!myId) return <AssigneeFact label={label} />;

  if (authority.assignAnyone) {
    return (
      <AdminAssigneeMenu
        applicantId={applicant.id}
        assignee={assignee}
        myId={myId}
        label={label}
      />
    );
  }

  if (authority.assignSelf && (!assignee || isMine)) {
    return (
      <Group gap="xs" wrap="nowrap">
        <AssigneeFact label={label} />
        <SelfAssignButton
          applicantId={applicant.id}
          myId={myId}
          mode={assignee ? "release" : "take"}
        />
      </Group>
    );
  }

  return (
    <AssigneeFact
      label={label}
      reason={
        authority.assignSelf
          ? "Only an Admin can reassign a file someone else holds."
          : undefined
      }
    />
  );
}
