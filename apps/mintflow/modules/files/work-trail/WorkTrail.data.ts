import { tokens } from "@/config/design";

import type { WorkTrailData } from "./WorkTrail.types";

/**
 * Static Work Trail seed for the fixed demo case (#2291). The screen mirrors the
 * app's "not wired" convention — there is no backend, so there are no async
 * loading / empty / error states to handle (single fixed case, always present).
 * Avatar colors are illustrative (the spec leaves them unspecified).
 */
export const workTrail: WorkTrailData = {
  case: {
    number: "CASE #2291",
    title: "Work trail",
    status: {
      label: "IN REVIEW",
      fg: "rgb(238,87,41)",
      bg: "rgba(238,87,41,0.1)",
    },
  },
  creator: { name: "R. Thapa", initials: "RT", color: tokens.green },
  createdLocation: "Central Office",
  owners: [
    {
      name: "A. Sharma",
      role: "Field lead · Press",
      initials: "AS",
      color: "rgb(205,66,26)",
      tag: {
        label: "DONE",
        fg: "rgb(30,120,75)",
        bg: "rgba(16,130,85,0.12)",
      },
    },
    {
      name: "P. Singh",
      role: "Analyst · Security",
      initials: "PS",
      color: "rgb(44,110,202)",
      tag: {
        label: "ACTIVE",
        fg: "rgb(205,66,26)",
        bg: "rgba(238,87,41,0.12)",
      },
    },
  ],
  subtasks: [
    {
      id: "collect",
      title: "Collect files & records",
      done: true,
      ring: "rgb(30,120,75)",
      who: "A.S",
    },
    {
      id: "interview",
      title: "Interview district officers",
      done: true,
      ring: "rgb(30,120,75)",
      who: "A.S",
    },
    {
      id: "draft",
      title: "Draft summary presentation",
      done: false,
      ring: "rgb(238,87,41)",
      who: "P.S",
    },
  ],
  progressLocation: "Border District B",
  approver: {
    name: "S. Gurung",
    role: "Approving officer",
    initials: "SG",
    color: "rgb(44,110,202)",
  },
  stages: {
    created: {
      label: "CREATED · 28 MAR · 09:12",
      labelColor: tokens.green,
      title: "Case opened — point A",
    },
    assigned: {
      label: "ASSIGNED · 28 MAR · 09:40",
      labelColor: tokens.green,
      title: "Split across 2 owners",
    },
    progress: {
      label: "IN PROGRESS · NOW",
      labelColor: "rgb(238,87,41)",
      title: "Field work & drafting",
    },
    approvalSent: {
      label: "APPROVAL SENT · 30 MAR · 16:05",
      labelColor: "rgb(44,110,202)",
      title: "Routed for sign-off",
    },
    approved: {
      label: "APPROVED · PENDING",
      labelColor: "rgba(0,0,0,0.42)",
      title: "Awaiting officer sign-off",
      titleMuted: true,
    },
    completed: {
      label: "COMPLETED",
      labelColor: "rgba(0,0,0,0.42)",
      title: "Case closed — point B",
      titleMuted: true,
    },
  },
};
