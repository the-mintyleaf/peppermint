"use client";

import { forwardRef } from "react";
import { Button, Group } from "@peppermint/ui";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { DotIcon } from "@phosphor-icons/react/dist/csr/Dot";

import type { StatusSwitchButtonProps } from "./StatusSwitchButton.types";

/**
 * The shared status-switch trigger — a pale, status-colored pill (dot + label +
 * caret/check) used as a `Menu.Target` for the inline stage/status switches in
 * the leads, journeys, and applicants tables. Forwards its ref and the props
 * `Menu.Target` injects so the dropdown wires up correctly.
 */
export const StatusSwitchButton = forwardRef<
  HTMLButtonElement,
  StatusSwitchButtonProps
>(function StatusSwitchButton(
  { label, color, terminal = false, ...rest },
  ref,
) {
  return (
    <Button
      ref={ref}
      px="xs"
      radius="xs"
      variant="light"
      color={color}
      size="xs"
      justify="space-between"
      rightSection={
        terminal ? (
          <CheckIcon size={12} weight="bold" aria-hidden />
        ) : (
          <CaretDownIcon size={12} aria-hidden />
        )
      }
      {...rest}
    >
      <Group gap={3}>
        <DotIcon
          size={12}
          color={`var(--mantine-color-${color}-6)`}
          weight="fill"
          aria-hidden
        />
        {label}
      </Group>
    </Button>
  );
});
