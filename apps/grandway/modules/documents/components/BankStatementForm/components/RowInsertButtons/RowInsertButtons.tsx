"use client";

import { Button, Group } from "@peppermint/ui";
import { PlusCircleIcon } from "@phosphor-icons/react/dist/csr/PlusCircle";
import { PercentIcon } from "@phosphor-icons/react/dist/csr/Percent";
import type { RowInsertButtonsProps } from "./RowInsertButtons.types";

/**
 * The two row-appending controls, rendered above *and* below the sheet: on a long
 * statement the operator is at the bottom of the scroll when the next row is needed,
 * and scrolling back up to a single toolbar breaks the typing rhythm.
 */
export function RowInsertButtons({
  onAddRow,
  onAddInterestAndTax,
  disabled,
}: RowInsertButtonsProps) {
  return (
    <Group gap="xs" wrap="nowrap">
      <Button
        size="xs"
        variant="light"
        leftSection={<PlusCircleIcon size={14} />}
        onClick={onAddRow}
        disabled={disabled}
      >
        Add row
      </Button>
      <Button
        size="xs"
        variant="light"
        color="teal"
        leftSection={<PercentIcon size={14} />}
        onClick={onAddInterestAndTax}
        disabled={disabled}
      >
        Interest &amp; Tax
      </Button>
    </Group>
  );
}
