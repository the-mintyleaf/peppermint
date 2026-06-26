"use client";

import {
  Badge,
  Button,
  Divider,
  Drawer,
  Group,
  Skeleton,
  Stack,
  Text,
} from "@peppermint/ui";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { BriefcaseIcon } from "@phosphor-icons/react/dist/csr/Briefcase";
import { PersonPositionChip } from "../../../_shared/PersonPositionChip";
import { StatusBadge } from "../../../_shared/StatusBadge";
import {
  getMembershipStatusActionLabel,
  MEMBERSHIP_STATUS_TRANSITIONS,
} from "../../people.constants";
import { usePersonDetail } from "../../people.hooks";
import type { PeopleProfileDrawerProps } from "./PeopleProfileDrawer.types";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function PeopleProfileDrawer({
  person,
  opened,
  onClose,
  onStatusChange,
}: PeopleProfileDrawerProps) {
  const membershipId = person?.id ?? null;
  const {
    person: detail,
    unitMemberships,
    positionAssignments,
    isLoading,
  } = usePersonDetail(membershipId, opened && person !== null);

  const display = detail ?? person;
  const transitions = display
    ? (MEMBERSHIP_STATUS_TRANSITIONS[display.membership_status] ?? [])
    : [];

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Member Profile"
      position="right"
      size="md"
      padding="md"
    >
      {!display ? null : (
        <Stack gap="lg">
          <Stack gap="sm">
            <PersonPositionChip
              personName={display.user_display_name}
              positionTitle={display.user_email}
              employeeCode={display.employee_code || undefined}
            />
            <Group gap="xs">
              <StatusBadge status={display.membership_status} size="sm" />
              {display.is_primary && (
                <Badge size="xs" color="blue" variant="light">
                  Primary org
                </Badge>
              )}
            </Group>
          </Stack>

          <Divider />

          <Stack gap="xs">
            <Text size="xs" fw={600} tt="uppercase" c="dimmed">
              Membership
            </Text>
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                Joined
              </Text>
              <Text size="xs">{formatDate(display.joined_at)}</Text>
            </Group>
            {display.ended_at && (
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  Ended
                </Text>
                <Text size="xs">{formatDate(display.ended_at)}</Text>
              </Group>
            )}
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                Employee code
              </Text>
              <Text size="xs">{display.employee_code || "—"}</Text>
            </Group>
          </Stack>

          <Divider />

          <Stack gap="sm">
            <Group gap={6}>
              <BuildingsIcon size={14} aria-label="Unit placements" />
              <Text size="sm" fw={600}>
                Unit Placements
              </Text>
            </Group>
            {isLoading ? (
              <Stack gap="xs">
                <Skeleton height={40} radius="sm" />
                <Skeleton height={40} radius="sm" />
              </Stack>
            ) : unitMemberships.length === 0 ? (
              <Text size="xs" c="dimmed">
                No unit assignments
              </Text>
            ) : (
              unitMemberships.map((um) => (
                <Stack
                  key={um.id}
                  gap={2}
                  p="xs"
                  bg="gray.0"
                  style={{ borderRadius: 6 }}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Text size="xs" fw={500}>
                      {um.unit_name}
                    </Text>
                    {um.is_primary && (
                      <Badge size="xs" color="blue" variant="light">
                        Primary
                      </Badge>
                    )}
                  </Group>
                  <Text size="xs" c="dimmed">
                    {um.unit_code}
                    {um.membership_type ? ` · ${um.membership_type}` : ""}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {formatDate(um.valid_from)}
                    {um.valid_to
                      ? ` → ${formatDate(um.valid_to)}`
                      : " → ongoing"}
                  </Text>
                </Stack>
              ))
            )}
          </Stack>

          <Divider />

          <Stack gap="sm">
            <Group gap={6}>
              <BriefcaseIcon size={14} aria-label="Position assignments" />
              <Text size="sm" fw={600}>
                Position Assignments
              </Text>
            </Group>
            {isLoading ? (
              <Stack gap="xs">
                <Skeleton height={40} radius="sm" />
                <Skeleton height={40} radius="sm" />
              </Stack>
            ) : positionAssignments.length === 0 ? (
              <Text size="xs" c="dimmed">
                No position assignments
              </Text>
            ) : (
              positionAssignments.map((pa) => (
                <Stack
                  key={pa.id}
                  gap={2}
                  p="xs"
                  bg="gray.0"
                  style={{ borderRadius: 6 }}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Text size="xs" fw={500}>
                      {pa.position_title}
                    </Text>
                    <StatusBadge status={pa.status} size="xs" />
                  </Group>
                  <Text size="xs" c="dimmed">
                    {pa.position_code} · {pa.assignment_type}
                    {pa.is_primary ? " · primary" : ""}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {formatDate(pa.starts_at)}
                    {pa.ends_at ? ` → ${formatDate(pa.ends_at)}` : " → ongoing"}
                  </Text>
                </Stack>
              ))
            )}
          </Stack>

          {transitions.length > 0 && (
            <>
              <Divider />
              <Stack gap="xs">
                <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                  Actions
                </Text>
                <Group gap="xs">
                  {transitions.map((status) => (
                    <Button
                      key={status}
                      size="xs"
                      variant={
                        status === "ended" || status === "archived"
                          ? "light"
                          : "filled"
                      }
                      color={
                        status === "ended" || status === "archived"
                          ? "red"
                          : status === "suspended"
                            ? "orange"
                            : "blue"
                      }
                      onClick={() => onStatusChange(display, status)}
                    >
                      {getMembershipStatusActionLabel(status)}
                    </Button>
                  ))}
                </Group>
              </Stack>
            </>
          )}
        </Stack>
      )}
    </Drawer>
  );
}
