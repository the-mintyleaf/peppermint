import type { ReactNode } from "react";
import type { QueryClientConfig } from "@tanstack/react-query";

export interface QueryClientWrapperProps {
  children: ReactNode;
  config?: QueryClientConfig;
}
