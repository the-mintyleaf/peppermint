import { createElement, isValidElement, type ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";
import type { DataTableColumn } from "mantine-datatable";
import type {
  DataTableShellColumn,
  DataTableShellColumnIcon,
} from "./DataTableShell.types";
import { getColumnLabel } from "./components/DataTableShellToolbar/toolbar.utils";

const HEADER_ICON_SIZE = 11;

function isIconComponent(icon: unknown): icon is Icon {
  if (typeof icon === "function") return true;
  return (
    typeof icon === "object" &&
    icon !== null &&
    "render" in icon &&
    "$$typeof" in icon
  );
}

function renderColumnIcon(icon: DataTableShellColumnIcon): ReactNode {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  if (isIconComponent(icon)) {
    return createElement(icon, {
      size: HEADER_ICON_SIZE,
      weight: "regular",
      style: {
        display: "inline-block",
        verticalAlign: "-0.125em",
        marginRight: "0.35em",
      },
    });
  }
  return icon;
}

export function buildColumnHeaderTitle<T extends object>(
  col: DataTableShellColumn<T>,
): ReactNode {
  if (!col.icon) return col.title ?? getColumnLabel(col);

  const label =
    typeof col.title === "string"
      ? col.title
      : (col.title ?? getColumnLabel(col));

  return (
    <>
      {renderColumnIcon(col.icon)}
      {typeof label === "string" ? label : label}
    </>
  );
}

export function mapShellColumnsToDataTableColumns<T extends object>(
  columns: DataTableShellColumn<T>[],
): DataTableColumn<T>[] {
  return columns.map((col) => {
    const {
      filter: _filter,
      key: _key,
      defaultVisible: _defaultVisible,
      icon: _icon,
      title: _title,
      ...rest
    } = col;

    return {
      ...rest,
      title: buildColumnHeaderTitle(col),
      ...(col.icon ? { titleStyle: { lineHeight: 1 } } : {}),
    } as DataTableColumn<T>;
  });
}
