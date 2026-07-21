"use client";

import { ActionIcon, Group, Menu } from "@peppermint/ui";
import { PlayIcon } from "@phosphor-icons/react/dist/csr/Play";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsThreeVertical";
import { CircleDashedIcon } from "@phosphor-icons/react/dist/csr/CircleDashed";
import { CircleHalfIcon } from "@phosphor-icons/react/dist/csr/CircleHalf";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";

import type { FocusState } from "../../../../module.api";
import type { FocusActionsProps } from "./FocusActions.types";

const STATUS_ITEMS: {
  value: FocusState;
  label: string;
  Icon: typeof CircleDashedIcon;
}[] = [
  { value: "todo", label: "To do", Icon: CircleDashedIcon },
  { value: "in_progress", label: "In progress", Icon: CircleHalfIcon },
  { value: "done", label: "Done", Icon: CheckCircleIcon },
];

/**
 * Trailing actions for a focus task — an icon to start/continue and a dropdown
 * to quick-update status. Shared by FocusSpotlight and FocusPill.
 */
export function FocusActions({
  state,
  size = 30,
  onContinue,
  onSetState,
}: FocusActionsProps) {
  const done = state === "done";

  return (
    <Group gap={4} wrap="nowrap" style={{ flex: "0 0 auto" }}>
      {!done ? (
        <ActionIcon
          variant="light"
          color="accent"
          radius="md"
          size={size}
          aria-label={state === "in_progress" ? "Continue task" : "Start task"}
          onClick={onContinue}
        >
          <PlayIcon size={16} weight="fill" />
        </ActionIcon>
      ) : null}

      <Menu shadow="sm" width={172} position="bottom-end">
        <Menu.Target>
          <ActionIcon
            variant="subtle"
            color="gray"
            radius="md"
            size={size}
            aria-label="Update status"
          >
            <DotsThreeVerticalIcon size={18} weight="bold" />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Set status</Menu.Label>
          {STATUS_ITEMS.map(({ value, label, Icon }) => (
            <Menu.Item
              key={value}
              leftSection={
                <Icon size={15} weight={value === state ? "fill" : "regular"} />
              }
              fw={value === state ? 700 : 500}
              disabled={value === state}
              onClick={() => onSetState(value)}
            >
              {label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
