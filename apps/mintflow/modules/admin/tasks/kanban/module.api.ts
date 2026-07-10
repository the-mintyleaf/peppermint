export type TaskStatus = "inbox" | "ongoing" | "hold" | "rejected";
export type TaskPriority = "urgent" | "important" | "normal";
export type TaskCategory =
  | "document_review"
  | "review"
  | "approval"
  | "general";
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

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: string;
  online: boolean;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "tm1",
    name: "Achmad Hakim",
    initials: "AH",
    color: "blue",
    role: "Designer",
    online: true,
  },
  {
    id: "tm2",
    name: "Samantha Emanuel",
    initials: "SE",
    color: "violet",
    role: "Project Manager",
    online: true,
  },
  {
    id: "tm3",
    name: "Sudhan Grg.",
    initials: "SG",
    color: "teal",
    role: "Developer",
    online: false,
  },
  {
    id: "tm4",
    name: "Rafi Andika",
    initials: "RA",
    color: "orange",
    role: "QA Engineer",
    online: true,
  },
  {
    id: "tm5",
    name: "Priya Sharma",
    initials: "PS",
    color: "pink",
    role: "Business Analyst",
    online: false,
  },
];

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
    startDate: "2026-06-03",
    endDate: "2026-06-28",
    tags: [
      { label: "Design", color: "pink" },
      { label: "Client Work", color: "teal" },
    ],
    attachments: [
      { name: "Brief_v1.pdf", size: "4.8 Mb", fileType: "pdf" },
      { name: "Workflow.fig", size: "12.4 Mb", fileType: "fig" },
    ],
    subtasks: [
      {
        id: "s1",
        title: "Schedule kickoff meeting",
        category: "Discovery",
        status: "completed",
        dueDate: "June 3, 2026",
      },
      {
        id: "s2",
        title: "Gather requirements",
        category: "Discovery",
        status: "completed",
        dueDate: "June 4, 2026",
      },
      {
        id: "s3",
        title: "Create wireframes",
        category: "Discovery",
        status: "in_progress",
        dueDate: "June 5, 2026",
      },
    ],
  },
  {
    id: "2",
    taskNumber: "T-1124124",
    title: "Q3 Internal Process Audit",
    category: "review",
    status: "inbox",
    priority: "normal",
    assignee: "Sudhan Grg.",
    createdAt: "12 minutes ago",
    group: "General Tasks",
    assignees: [{ name: "Sudhan Grg.", initials: "SG", color: "teal" }],
    startDate: "2026-06-10",
    endDate: "2026-07-05",
    tags: [{ label: "Internal", color: "gray" }],
    subtasks: [
      {
        id: "s4",
        title: "Draft audit checklist",
        category: "Preparation",
        status: "completed",
        dueDate: "June 12, 2026",
      },
      {
        id: "s5",
        title: "Interview department heads",
        category: "Execution",
        status: "pending",
        dueDate: "June 20, 2026",
      },
      {
        id: "s6",
        title: "Compile findings report",
        category: "Reporting",
        status: "pending",
        dueDate: "July 1, 2026",
      },
    ],
  },
  {
    id: "3",
    taskNumber: "T-1124125",
    title: "Annual Budget Review & Approval",
    category: "approval",
    status: "ongoing",
    priority: "urgent",
    assignee: "Samantha Emanuel",
    createdAt: "2 hours ago",
    group: "Finance",
    assignees: [
      { name: "Samantha Emanuel", initials: "SE", color: "violet" },
      { name: "Rafi Andika", initials: "RA", color: "orange" },
    ],
    startDate: "2026-06-01",
    endDate: "2026-06-24",
    tags: [
      { label: "Finance", color: "yellow" },
      { label: "Urgent", color: "red" },
    ],
    subtasks: [
      {
        id: "s7",
        title: "Collect department budgets",
        category: "Collection",
        status: "completed",
        dueDate: "June 5, 2026",
      },
      {
        id: "s8",
        title: "Consolidate into master sheet",
        category: "Analysis",
        status: "completed",
        dueDate: "June 10, 2026",
      },
      {
        id: "s9",
        title: "Present to board",
        category: "Approval",
        status: "completed",
        dueDate: "June 20, 2026",
      },
      {
        id: "s10",
        title: "Receive sign-off",
        category: "Approval",
        status: "in_progress",
        dueDate: "June 24, 2026",
      },
    ],
    requestStatus: "Request Seen.",
    approvalStatus: "Awaiting final approval",
  },
  {
    id: "4",
    taskNumber: "T-1124126",
    title: "Vendor Contract Review — Cloud Infrastructure",
    category: "review",
    status: "ongoing",
    priority: "normal",
    assignee: "Priya Sharma",
    createdAt: "1 day ago",
    group: "Operations",
    assignees: [
      { name: "Priya Sharma", initials: "PS", color: "pink" },
      { name: "Achmad Hakim", initials: "AH", color: "blue" },
    ],
    startDate: "2026-06-15",
    endDate: "2026-07-10",
    tags: [
      { label: "Vendor", color: "indigo" },
      { label: "Legal", color: "grape" },
    ],
    subtasks: [
      {
        id: "s11",
        title: "Review SLA terms",
        category: "Legal",
        status: "completed",
        dueDate: "June 18, 2026",
      },
      {
        id: "s12",
        title: "Validate pricing structure",
        category: "Finance",
        status: "in_progress",
        dueDate: "June 25, 2026",
      },
      {
        id: "s13",
        title: "Legal team sign-off",
        category: "Legal",
        status: "pending",
        dueDate: "July 5, 2026",
      },
    ],
  },
  {
    id: "5",
    taskNumber: "T-1124127",
    title: "Onboarding Deck — New Hires July Cohort",
    category: "document_review",
    status: "ongoing",
    priority: "important",
    assignee: "Rafi Andika",
    createdAt: "3 hours ago",
    group: "HR",
    assignees: [
      { name: "Rafi Andika", initials: "RA", color: "orange" },
      { name: "Samantha Emanuel", initials: "SE", color: "violet" },
      { name: "Priya Sharma", initials: "PS", color: "pink" },
    ],
    startDate: "2026-06-18",
    endDate: "2026-06-27",
    tags: [
      { label: "HR", color: "cyan" },
      { label: "Internal", color: "gray" },
    ],
    subtasks: [
      {
        id: "s14",
        title: "Draft slides outline",
        category: "Content",
        status: "completed",
        dueDate: "June 19, 2026",
      },
      {
        id: "s15",
        title: "Add company values section",
        category: "Content",
        status: "completed",
        dueDate: "June 21, 2026",
      },
      {
        id: "s16",
        title: "Review with HR manager",
        category: "Review",
        status: "completed",
        dueDate: "June 23, 2026",
      },
      {
        id: "s17",
        title: "Finalize and export PDF",
        category: "Production",
        status: "pending",
        dueDate: "June 27, 2026",
      },
    ],
  },
  {
    id: "6",
    taskNumber: "T-1124128",
    title: "Compliance Policy Update — Data Handling",
    category: "document_review",
    status: "hold",
    priority: "normal",
    assignee: "Sudhan Grg.",
    createdAt: "5 days ago",
    group: "Compliance",
    assignees: [{ name: "Sudhan Grg.", initials: "SG", color: "teal" }],
    startDate: "2026-05-20",
    endDate: "2026-06-20",
    tags: [
      { label: "Compliance", color: "red" },
      { label: "Legal", color: "grape" },
    ],
    subtasks: [
      {
        id: "s18",
        title: "Identify outdated clauses",
        category: "Analysis",
        status: "completed",
        dueDate: "May 25, 2026",
      },
      {
        id: "s19",
        title: "Draft revised policy",
        category: "Drafting",
        status: "in_progress",
        dueDate: "June 10, 2026",
      },
      {
        id: "s20",
        title: "Legal review",
        category: "Review",
        status: "pending",
        dueDate: "June 18, 2026",
      },
    ],
    requestStatus: "Request Unseen.",
    approvalStatus: "Awaiting approval",
  },
  {
    id: "7",
    taskNumber: "T-1124129",
    title: "Marketing Campaign Performance Review — Q2",
    category: "general",
    status: "inbox",
    priority: "normal",
    assignee: "Achmad Hakim",
    createdAt: "30 minutes ago",
    group: "Marketing",
    assignees: [
      { name: "Achmad Hakim", initials: "AH", color: "blue" },
      { name: "Priya Sharma", initials: "PS", color: "pink" },
    ],
    startDate: "2026-06-22",
    endDate: "2026-07-15",
    tags: [{ label: "Marketing", color: "orange" }],
    subtasks: [
      {
        id: "s21",
        title: "Pull analytics data",
        category: "Data",
        status: "pending",
        dueDate: "June 25, 2026",
      },
      {
        id: "s22",
        title: "Prepare summary report",
        category: "Reporting",
        status: "pending",
        dueDate: "July 5, 2026",
      },
      {
        id: "s23",
        title: "Present to stakeholders",
        category: "Presentation",
        status: "pending",
        dueDate: "July 15, 2026",
      },
    ],
  },
];

export async function fetchTasks(filter: TaskBoardFilter): Promise<Task[]> {
  await new Promise((r) => setTimeout(r, 200));
  if (filter === "all") return MOCK_TASKS;
  return MOCK_TASKS.slice(0, 3);
}
