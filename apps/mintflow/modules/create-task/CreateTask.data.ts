import type { PickerOption, SubTask } from "./CreateTask.types";

/** Status picker options — chip carries a leading dot + full color set. */
export const statusOptions: PickerOption[] = [
  {
    key: "todo",
    label: "To do",
    dot: "rgba(0,0,0,0.3)",
    fg: "rgba(0,0,0,0.6)",
    bg: "rgba(0,0,0,0.05)",
    border: "rgba(0,0,0,0.1)",
  },
  {
    key: "ongoing",
    label: "Ongoing",
    dot: "rgb(106,168,255)",
    fg: "rgb(44,110,202)",
    bg: "rgba(44,110,202,0.1)",
    border: "rgba(44,110,202,0.3)",
  },
  {
    key: "onnext",
    label: "On-Next",
    dot: "rgb(238,87,41)",
    fg: "rgb(205,66,26)",
    bg: "rgba(238,87,41,0.1)",
    border: "rgba(238,87,41,0.3)",
  },
  {
    key: "done",
    label: "Complete",
    dot: "rgb(30,120,75)",
    fg: "rgb(30,120,75)",
    bg: "rgba(16,130,85,0.1)",
    border: "rgba(16,130,85,0.3)",
  },
];

/** Priority picker options — chip carries no dot. */
export const priorityOptions: PickerOption[] = [
  {
    key: "low",
    label: "Low",
    fg: "rgba(0,0,0,0.6)",
    bg: "rgba(0,0,0,0.05)",
    border: "rgba(0,0,0,0.1)",
  },
  {
    key: "med",
    label: "Medium",
    fg: "rgb(44,110,202)",
    bg: "rgba(44,110,202,0.1)",
    border: "rgba(44,110,202,0.3)",
  },
  {
    key: "high",
    label: "High",
    fg: "rgb(205,66,26)",
    bg: "rgba(238,87,41,0.1)",
    border: "rgba(238,87,41,0.3)",
  },
];

/** Default selections. */
export const DEFAULT_STATUS = "todo";
export const DEFAULT_PRIORITY = "med";

/** Seed sub-tasks + the next id to assign on add. */
export const seedSubs: SubTask[] = [
  { id: 1, title: "Gather source documents", done: true },
  { id: 2, title: "Draft the response", done: false },
];
export const SEED_NEXT_ID = 3;
