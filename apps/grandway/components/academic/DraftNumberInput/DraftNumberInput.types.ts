import type { NumberInputProps } from "@peppermint/ui";

export interface DraftNumberInputProps extends Omit<
  NumberInputProps,
  "value" | "onChange" | "onValueChange"
> {
  /** The committed value held in the form — a number, or `null` when blank. */
  value: number | null | undefined;
  /** Called with the parsed number (or `null`) on every keystroke. */
  onNumberChange: (value: number | null) => void;
}
