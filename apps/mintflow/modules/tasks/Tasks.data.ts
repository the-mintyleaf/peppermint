import type { Task } from "./Tasks.types";

/** Static mock seed — the tasks list is not wired to a backend yet. */
export const tasks: Task[] = [
  {
    category: "GENERAL",
    title:
      "Find files on the Case of Kabin Devkota & upload a presentation for the team.",
    status: "Ongoing",
    meta: "32 min left",
    urgent: true,
  },
  {
    category: "PRESS",
    title: "Draft response to media queries on budget allocation.",
    status: "On-Next",
    meta: "Due 4:00 PM",
  },
  {
    category: "SECURITY",
    title: "Review security briefing for the border districts.",
    status: "Ongoing",
    meta: "2h left",
  },
  {
    category: "GENERAL",
    title: "Prepare talking points for the parliament session.",
    status: "On-Next",
    meta: "Tomorrow 10:00",
  },
  {
    category: "FINANCE",
    title: "Sign off the quarterly expenditure report.",
    status: "Complete",
    meta: "Submitted Mar 31",
  },
  {
    category: "ADMIN",
    title: "Approve pending appointment letters.",
    status: "Complete",
    meta: "Cleared today",
  },
  {
    category: "SECURITY",
    title: "Coordinate logistics for the ministerial visit.",
    status: "Ongoing",
    meta: "Due 6:00 PM",
  },
];
