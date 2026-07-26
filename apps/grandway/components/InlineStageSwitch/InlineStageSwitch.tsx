"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Button, Group, Menu, Text } from "@peppermint/ui";
import { StatusBadge } from "@peppermint/admin";
import { DotIcon } from "@phosphor-icons/react/dist/csr/Dot";

import { StatusSwitchButton } from "@/components/StatusSwitchButton";
import type { InlineStageSwitchProps } from "./InlineStageSwitch.types";

/**
 * The interactive Stage/Status cell shared by the leads, journeys, and
 * applicants tables. The pill opens a `Menu` of forward targets; picking a
 * plain target swaps the dropdown to an inline "Move to X?" confirmation that
 * runs the mutation in place (no modal). Remark-required transitions
 * (`actions`) sit below a divider and hand off to a structured modal instead.
 *
 * A read-only record (`disabled`) falls back to a plain badge — a fact, not a
 * lever — so the switch never appears where a change would be rejected. A
 * `terminal` record keeps the pill look but reads as settled (a check, not a
 * caret) and only offers its way-back action.
 */
export function InlineStageSwitch({
  current,
  colorMap,
  labelMap,
  targets,
  onConfirm,
  actions = [],
  terminal = false,
  disabled = false,
  entityLabel,
  menuLabel = "Move to",
}: InlineStageSwitchProps) {
  const [opened, setOpened] = useState(false);
  const [confirming, setConfirming] = useState<string>();
  const [busy, setBusy] = useState(false);

  // Guards for the async confirm. `mounted` avoids a state update after the
  // cell unmounts (a successful move can invalidate a board and drop this row);
  // `seq` invalidates an in-flight confirm the moment the menu closes or a new
  // one starts, so a slow request can't later force the menu shut and silently
  // discard a target the user has since re-picked.
  const mounted = useRef(true);
  const seq = useRef(0);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  const currentLabel = labelMap[current] ?? current;

  if (disabled) {
    return (
      <StatusBadge value={current} colorMap={colorMap} labelMap={labelMap} />
    );
  }

  const hasTargets = targets.length > 0;
  const hasActions = actions.length > 0;

  const close = () => {
    seq.current += 1;
    setOpened(false);
    setConfirming(undefined);
    setBusy(false);
  };

  const handleConfirm = async () => {
    if (!confirming || busy) return;
    const token = (seq.current += 1);
    setBusy(true);
    try {
      await onConfirm(confirming);
      if (mounted.current && token === seq.current) close();
    } catch {
      // Error surfaces through the app's mutation notification; keep the
      // confirm panel open so the user can retry or cancel — unless this
      // request was superseded or the cell unmounted meanwhile.
      if (mounted.current && token === seq.current) setBusy(false);
    }
  };

  return (
    <Menu
      opened={opened}
      onChange={(next) => (next ? setOpened(true) : close())}
      position="bottom-start"
      withinPortal
      closeOnItemClick={false}
      disabled={!hasTargets && !hasActions}
    >
      <Menu.Target>
        <StatusSwitchButton
          fullWidth
          terminal={terminal}
          label={currentLabel}
          color={colorMap[current] ?? "gray"}
          aria-label={
            terminal
              ? `${entityLabel}: ${currentLabel} — settled`
              : `Change status for ${entityLabel}, currently ${currentLabel}`
          }
        />
      </Menu.Target>
      <Menu.Dropdown>
        {confirming ? (
          <Box p="xs" miw={200}>
            <Text size="xs" mb="sm">
              Move to <b>{labelMap[confirming] ?? confirming}</b>?
            </Text>
            <Group gap="xs" justify="flex-end">
              <Button
                size="xs"
                variant="default"
                onClick={() => setConfirming(undefined)}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button
                size="xs"
                color={colorMap[confirming] ?? "gray"}
                loading={busy}
                onClick={handleConfirm}
                data-autofocus
                autoFocus
              >
                Confirm
              </Button>
            </Group>
          </Box>
        ) : (
          <>
            {hasTargets ? (
              <>
                <Menu.Label>{menuLabel}</Menu.Label>
                {targets.map((t) => (
                  <Menu.Item
                    key={t}
                    leftSection={
                      <DotIcon
                        size={12}
                        color={`var(--mantine-color-${colorMap[t] ?? "gray"}-6)`}
                        weight="fill"
                        aria-hidden
                      />
                    }
                    onClick={() => setConfirming(t)}
                  >
                    {labelMap[t] ?? t}
                  </Menu.Item>
                ))}
              </>
            ) : null}
            {hasTargets && hasActions ? <Menu.Divider /> : null}
            {actions.map((action) => (
              <Menu.Item
                key={action.label}
                color={action.color}
                leftSection={action.icon}
                onClick={() => {
                  close();
                  action.onClick();
                }}
              >
                {action.label}
              </Menu.Item>
            ))}
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
