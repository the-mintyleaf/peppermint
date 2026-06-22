import type { ComponentType } from 'react';
import { CalendarIcon } from '@phosphor-icons/react/dist/csr/Calendar';
import { CaretCircleDownIcon } from '@phosphor-icons/react/dist/csr/CaretCircleDown';
import { HashIcon } from '@phosphor-icons/react/dist/csr/Hash';
import { TextAaIcon } from '@phosphor-icons/react/dist/csr/TextAa';
import type {
  DataTableColumnFilter,
  DataTableColumnFilterType,
  DataTableShellColumn,
} from '../../DataTableShell.types';

type FilterIcon = ComponentType<{ size?: number; weight?: string }>;

const FILTER_TYPE_ICONS: Record<DataTableColumnFilterType, FilterIcon> = {
  text: TextAaIcon as FilterIcon,
  select: CaretCircleDownIcon as FilterIcon,
  number: HashIcon as FilterIcon,
  date: CalendarIcon as FilterIcon,
};

export function getColumnKey<T>(col: DataTableShellColumn<T>): string {
  return col.key ?? String(col.accessor);
}

export function getColumnLabel<T>(col: DataTableShellColumn<T>): string {
  return typeof col.title === 'string' ? col.title : getColumnKey(col);
}

export function getFilterIcon(filter?: DataTableColumnFilter): FilterIcon {
  if (filter?.icon) return filter.icon as FilterIcon;
  const type = filter?.type ?? 'text';
  return FILTER_TYPE_ICONS[type];
}

export function getFilterableColumns<T extends Record<string, unknown>>(
  columns: DataTableShellColumn<T>[],
) {
  return columns.filter((col) => col.filter != null);
}

export function buildColumnLabelMap<T extends Record<string, unknown>>(
  columns: DataTableShellColumn<T>[],
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const col of columns) {
    map[getColumnKey(col)] = getColumnLabel(col);
  }
  return map;
}

export function formatFilterValue(
  value: unknown,
  filter?: DataTableColumnFilter,
): string {
  if (value !== null && typeof value === 'object' && 'label' in value) {
    return String((value as Record<string, unknown>).label);
  }
  if (filter?.type === 'select' && filter.options) {
    const match = filter.options.find((o) => o.value === value);
    if (match) return match.label;
  }
  return String(value);
}
