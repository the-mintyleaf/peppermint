import type { PaperProps } from "@mantine/core";
import type { ReactNode } from "react";

export type ModalPaperProps = PaperProps & {
  children?: ReactNode;
};
