import type { FocusTask, HomeNavRowData, HomeTask } from "./Home.types";

/** Seed data mirrors the Kamban mockup — no backend is wired for this screen. */

export const focusTask: FocusTask = {
  category: "GENERAL",
  time: "09:00 · TODAY",
  timeLeft: "32 min left",
  title:
    "Find files regarding the Case of Kabin Devkota & upload a neat presentation for the team.",
  assignee: "Sudhan Gurung",
  caseLabel: "Media Propaganda against Government",
};

export const homeTasks: HomeTask[] = [
  { id: "t1", title: "Review and respond to emails", category: "General" },
  {
    id: "t2",
    title: "Draft response to media queries on budget",
    category: "Press",
  },
  {
    id: "t3",
    title: "Prepare talking points for parliament",
    category: "General",
  },
];

export const homeNavRows: HomeNavRowData[] = [
  { id: "schedule", label: "Schedule", icon: "calendar" },
  { id: "reflect", label: "Reflect", icon: "sparkle" },
];
