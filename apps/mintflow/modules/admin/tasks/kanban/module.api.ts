export type TaskStatus = "inbox" | "ongoing" | "hold" | "rejected";
export type TaskPriority = "urgent" | "important" | "normal";
export type TaskCategory = "document_review" | "review" | "approval" | "general";
export type TaskBoardFilter = "all" | "mine" | "team" | "department";
export type SubtaskStatus = "completed" | "in_progress" | "pending";

export interface TaskAssignee {
  name: string;
  initials: string;
  color: string;
}

export interface TaskTag {
  label: string;
  color: string;
}

export interface TaskAttachment {
  name: string;
  size: string;
  fileType: "pdf" | "fig" | "img" | "other";
}

export interface TaskSubtask {
  id: string;
  title: string;
  category: string;
  status: SubtaskStatus;
  dueDate: string;
}

export interface Task extends Record<string, unknown> {
  id: string;
  taskNumber: string;
  title: string;
  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  createdAt: string;
  group: string;
  requestStatus?: string;
  approvalStatus?: string;
  // Detail fields
  description?: string;
  assignees?: TaskAssignee[];
  startDate?: string;
  endDate?: string;
  tags?: TaskTag[];
  attachments?: TaskAttachment[];
  subtasks?: TaskSubtask[];
}

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  document_review: "Document Review & Signing",
  review: "Review",
  approval: "Approval",
  general: "General",
};

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  document_review: "blue.9",
  review: "violet",
  approval: "teal",
  general: "gray.7",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  inbox: "New",
  ongoing: "In Progress",
  hold: "On Hold",
  rejected: "Rejected",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  inbox: "gray",
  ongoing: "yellow",
  hold: "orange",
  rejected: "red",
};

export const SUBTASK_STATUS_LABELS: Record<SubtaskStatus, string> = {
  completed: "Completed",
  in_progress: "In Progress",
  pending: "Pending",
};

export const SUBTASK_STATUS_COLORS: Record<SubtaskStatus, string> = {
  completed: "green",
  in_progress: "yellow",
  pending: "gray",
};

export const MOCK_TASKS: Task[] = [
  {
    id: "1",
    taskNumber: "T-1124123",
    title: "Website Redesign for Client X",
    category: "document_review",
    status: "ongoing",
    priority: "normal",
    assignee: "Achmad Hakim",
    createdAt: "12 minutes ago",
    group: "Client Projects",
    description:
      "Complete redesign of the client website including new branding, responsive layouts, and improved user experience across all key pages.",
    assignees: [
      { name: "Achmad Hakim", initials: "AH", color: "blue" },
      { name: "Samantha Emanuel", initials: "SE", color: "violet" },
    ],
    startDate: "June 3, 2025",
    endDate: "June 28, 2025",
    tags: [
      { label: "Design", color: "pink" },
      { label: "Client Work", color: "teal" },
    ],
    attachments: [
      { name: "Brief_v1.pdf", size: "4.8 Mb", fileType: "pdf" },
      { name: "Workflow.fig", size: "12.4 Mb", fileType: "fig" },
    ],
    subtasks: [
      { id: "s1", title: "Schedule kickoff meeting", category: "Discovery", status: "completed", dueDate: "June 3, 2025" },
      { id: "s2", title: "Gather requirements", category: "Discovery", status: "completed", dueDate: "June 4, 2025" },
      { id: "s3", title: "Create wireframes", category: "Discovery", status: "in_progress", dueDate: "June 5, 2025" },
    ],
  },
  {
    id: "2",
    taskNumber: "T-1124124",
    title: "Strengthen internal coordination, service delivery, and institutional performance",
    category: "review",
    status: "inbox",
    priority: "normal",
    assignee: "Sudhan Grg.",
    createdAt: "12 minutes ago",
    group: "General Tasks",
  },
  {
    id: "3",
    taskNumber: "T-1124125",
    title: "Strengthen internal coordination, service delivery, and institutional performance",
    category: "document_review",
    status: "ongoing",
    priority: "urgent",
    assignee: "Sudhan Grg.",
    createdAt: "12 minutes ago",
    group: "General Tasks",
  },
  {
    id: "4",
    taskNumber: "T-1124126",
    title: "Strengthen internal coordination, service delivery, and institutional performance",
    category: "review",
    status: "ongoing",
    priority: "normal",
    assignee: "Sudhan Grg.",
    createdAt: "12 minutes ago",
    group: "General Tasks",
  },
  {
    id: "5",
    taskNumber: "T-1124127",
    title: "Strengthen internal coordination, service delivery, and institutional performance",
    category: "document_review",
    status: "ongoing",
    priority: "important",
    assignee: "Sudhan Grg.",
    createdAt: "12 minutes ago",
    group: "General Tasks",
  },
  {
    id: "6",
    taskNumber: "T-1124128",
    title: "Strengthen internal coordination, service delivery, and institutional performance",
    category: "document_review",
    status: "hold",
    priority: "normal",
    assignee: "Sudhan Grg.",
    createdAt: "12 minutes ago",
    group: "General Tasks",
    requestStatus: "Request Unseen.",
    approvalStatus: "Awaiting approval",
  },
];

export async function fetchTasks(filter: TaskBoardFilter): Promise<Task[]> {
  await new Promise((r) => setTimeout(r, 200));
  if (filter === "all") return MOCK_TASKS;
  return MOCK_TASKS.slice(0, 3);
}
