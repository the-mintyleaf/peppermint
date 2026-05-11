import { useCallback } from 'react';
import { useDataTableContext } from '../../wrappers/DataTableWrapper';
import type { ColumnDef } from './DataTableShell.types';

export function useExport<T = unknown>(columns: ColumnDef<T>[], filename = 'export.csv') {
  const { rows } = useDataTableContext<T>();

  return useCallback(() => {
    const header = columns.map((c) => c.label).join(',');
    const body = rows.map((row) =>
      columns.map((col) => {
        const val = row[col.key as keyof T];
        const str = val === null || val === undefined ? '' : String(val);
        // Escape quotes and wrap in quotes if contains comma or newline
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(',')
    );
    const csv = [header, ...body].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [rows, columns, filename]);
}
