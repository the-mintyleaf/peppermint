"use client";

import type { ReactNode } from "react";
import { ActionIcon, Menu } from "@peppermint/ui";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsThreeVertical";

export interface RowAction<T> {
  label: string;
  icon?: ReactNode;
  /** Mantine color for the item (e.g. "red" for destructive). */
  color?: string;
  onClick: (record: T) => void;
  /** Hide this item for a given row. */
  hidden?: (record: T) => boolean;
  /** Disable (but still show) this item for a given row. */
  disabled?: (record: T) => boolean;
  /** Render a divider above this item. */
  dividerBefore?: boolean;
}

export interface RowActionsMenuProps<T> {
  record: T;
  actions: RowAction<T>[];
  "aria-label"?: string;
}

/**
 * The `Menu > ActionIcon(dots) > Dropdown` row-action pattern hand-rolled in 5
 * list modules, consolidated into one config-driven component. Renders nothing
 * when no action is visible for the row.
 */
export function RowActionsMenu<T>({
  record,
  actions,
  "aria-label": ariaLabel = "Row actions",
}: RowActionsMenuProps<T>) {
  const visible = actions.filter((action) => !action.hidden?.(record));
  if (visible.length === 0) return null;

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" aria-label={ariaLabel}>
          <DotsThreeVerticalIcon size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {visible.map((action, index) => (
          <div key={action.label}>
            {action.dividerBefore && index > 0 && <Menu.Divider />}
            <Menu.Item
              leftSection={action.icon}
              color={action.color}
              disabled={action.disabled?.(record)}
              onClick={() => action.onClick(record)}
            >
              {action.label}
            </Menu.Item>
          </div>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
