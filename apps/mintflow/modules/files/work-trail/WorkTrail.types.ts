import type { ReactNode } from "react";

/** A person reference rendered as a colored initials avatar + name. */
export interface TrailPerson {
  name: string;
  initials: string;
  /** Avatar background color. */
  color: string;
}

/** A small tag pill (e.g. DONE / ACTIVE) shown at the trailing edge of a card. */
export interface TrailTag {
  label: string;
  fg: string;
  bg: string;
}

/** An owner the case is split across (Stage 2 branch block). */
export interface TrailOwner extends TrailPerson {
  role: string;
  tag: TrailTag;
}

/** A field-work sub-task (Stage 3 subtask card). */
export interface TrailSubtask {
  id: string;
  title: string;
  done: boolean;
  /** Check-ring color. */
  ring: string;
  /** Trailing owner initials, e.g. "A.S". */
  who: string;
}

/** The approving officer the case is routed to (Stage 4). */
export interface TrailApprover extends TrailPerson {
  role: string;
}

/** Per-stage heading seed (label / timestamp line + title). */
export interface StageMeta {
  /** Uppercase mono label + timestamp, e.g. "CREATED · 28 MAR · 09:12". */
  label: string;
  /** Color of the mono label. */
  labelColor: string;
  title: string;
  /** Render the title in the muted (pending) color. */
  titleMuted?: boolean;
}

export type StageId =
  | "created"
  | "assigned"
  | "progress"
  | "approvalSent"
  | "approved"
  | "completed";

/** The whole Work Trail mock payload. */
export interface WorkTrailData {
  case: {
    number: string;
    title: string;
    status: TrailTag;
  };
  creator: TrailPerson;
  createdLocation: string;
  owners: TrailOwner[];
  subtasks: TrailSubtask[];
  progressLocation: string;
  approver: TrailApprover;
  stages: Record<StageId, StageMeta>;
}

/** Connector line style below a stage node. */
export type TrailConnector = "solid" | "dotted" | "none";

export interface TrailStageProps {
  /** The node circle rendered at the top of the left rail. */
  node: ReactNode;
  /** Style of the connector line running down to the next stage. */
  connector: TrailConnector;
  /** Connector color (ignored when `connector` is "none"). */
  connectorColor?: string;
  children: ReactNode;
}

export interface TrailNodeProps {
  background?: string;
  /** Full border shorthand, e.g. "2px solid rgba(0,0,0,0.2)". */
  border?: string;
  boxShadow?: string;
  /** Glyph rendered centered inside the node. */
  children?: ReactNode;
}

export interface AvatarProps {
  initials: string;
  color: string;
  size?: number;
}

export interface PersonChipProps {
  person: TrailPerson;
}

export interface LocationChipProps {
  label: string;
}

export interface OwnerCardProps {
  name: string;
  role: string;
  initials: string;
  /** Avatar background color. */
  color: string;
  /** Trailing slot (tag pill / mono status text). */
  right: ReactNode;
  /** Card border shorthand. */
  border: string;
  /** Card background. */
  background: string;
  /** Render a dotted connector stub on the left (branch owners). */
  stub?: boolean;
}
