"use client";

import { useCallback, useRef, type KeyboardEvent } from "react";

/**
 * Spreadsheet cell navigation: Enter moves down the same column, Shift+Enter moves
 * up, and Enter on the last row appends a new transaction and lands on it.
 *
 * Only Enter is bound — the arrow keys stay with `NumberInput`'s value stepping and
 * `DateInput`'s calendar, which operators expect inside those controls.
 *
 * Cells opt in with `cellProps(row, column)`, which stamps a `data-cell` coordinate the
 * hook resolves against. New rows render a frame later, so the append path re-queries
 * on the next animation frame.
 */
export function useGridNavigation(rowCount: number, onAddRow: () => void) {
  const gridRef = useRef<HTMLDivElement>(null);

  const focusCell = useCallback((row: number, column: string) => {
    const target = gridRef.current?.querySelector<HTMLElement>(
      `[data-cell="${row}:${column}"] input`,
    );
    target?.focus();
    if (target instanceof HTMLInputElement) target.select();
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>, row: number, column: string) => {
      if (event.key !== "Enter") return;
      // Enter would otherwise submit the surrounding form.
      event.preventDefault();

      if (event.shiftKey) {
        if (row > 0) focusCell(row - 1, column);
        return;
      }

      if (row < rowCount - 1) {
        focusCell(row + 1, column);
        return;
      }

      onAddRow();
      requestAnimationFrame(() => focusCell(row + 1, column));
    },
    [focusCell, onAddRow, rowCount],
  );

  const cellProps = useCallback(
    (row: number, column: string) => ({
      "data-cell": `${row}:${column}`,
      onKeyDown: (event: KeyboardEvent<HTMLElement>) =>
        handleKeyDown(event, row, column),
    }),
    [handleKeyDown],
  );

  return { gridRef, cellProps };
}
