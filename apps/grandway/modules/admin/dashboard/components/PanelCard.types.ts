import type { ComponentType, ReactNode } from "react";

export interface PanelView {
  /** Stable key; also the `Menu` item value. */
  value: string;
  label: string;
  /** One line under the label in the menu — what this view answers. */
  description?: string;
  /** Real total for the view, when the view has one. Rendered beside the label. */
  count?: number;
}

export interface PanelCardProps {
  title: string;
  /** The question the card answers, or the caveat on reading it. */
  subtitle?: string;
  icon?: ComponentType<{ size?: number }>;
  /** Selectable views. Omit for a single-view card — the menu then never renders. */
  views?: PanelView[];
  /** `value` of the open view. Required when `views` is passed. */
  activeView?: string;
  onViewChange?: (value: string) => void;
  /** Quiet trailing control (a "see all" link). Sits left of the view menu. */
  actions?: ReactNode;
  /** Floor for the body so a short view doesn't collapse a side-by-side row. */
  minBodyHeight?: number;
  children: ReactNode;
}
