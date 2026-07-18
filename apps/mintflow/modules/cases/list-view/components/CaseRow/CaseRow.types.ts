import type {
  Directory,
  DirectoryUnit,
  DirectoryUser,
  WorkItem,
} from "@/lib/work";

export interface CaseRowProps {
  workCase: WorkItem;
  onOpen: (workCase: WorkItem) => void;
  actorDir: Directory<DirectoryUser>;
  unitDir: Directory<DirectoryUnit>;
}
