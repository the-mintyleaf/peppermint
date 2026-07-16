import type { SubTask } from "../../CreateTask.types";

export interface SubTasksProps {
  /** Current sub-task list. */
  subs: SubTask[];
  /** Draft text for the add-a-sub-task input. */
  newSub: string;
  /** Toggle a sub-task done/undone. */
  onToggle: (id: number) => void;
  /** Remove a sub-task. */
  onRemove: (id: number) => void;
  /** Update the draft add input. */
  onNewSubChange: (value: string) => void;
  /** Commit the draft as a new sub-task (on Enter). */
  onAdd: () => void;
}
