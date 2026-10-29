/**
 * Spread onto every focusable element of the suggest popover. A Mantine Modal or
 * Drawer closes on Escape from a window-level capture listener — it fires before the
 * popover sees the key — unless the focused element carries this attribute (the same
 * flag Mantine's own Combobox sets). Without it, Escape in the popover would close
 * the document form underneath and discard what was typed.
 */
export const STOP_MODAL_ESCAPE = {
  "data-mantine-stop-propagation": true,
} as const;
