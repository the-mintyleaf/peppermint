import type { MonoTextProps } from "../MonoText";

export interface SectionLabelProps extends Omit<MonoTextProps, "label"> {
  children?: React.ReactNode;
}
