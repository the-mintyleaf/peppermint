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

export interface Task {
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
  {
    id: "8",
    taskNumber: "T-1124130",
    title: "Security Vulnerability Triage — Auth Service",
    category: "review",
    status: "inbox",
    priority: "urgent",
    assignee: "Sudhan Grg.",
    createdAt: "just now",
    group: "Engineering",
    description:
      "Triage the reported authentication bypass, assess blast radius, and prioritize a patch.",
    assignees: [{ name: "Sudhan Grg.", initials: "SG", color: "teal" }],
    startDate: "2026-07-11",
    endDate: "2026-07-13",
    tags: [
      { label: "Security", color: "red" },
      { label: "Urgent", color: "red" },
    ],
    subtasks: [
      {
        id: "s24",
        title: "Reproduce the exploit",
        category: "Investigation",
        status: "in_progress",
        dueDate: "July 11, 2026",
      },
      {
        id: "s25",
        title: "Scope affected endpoints",
        category: "Investigation",
        status: "pending",
        dueDate: "July 12, 2026",
      },
    ],
  },
  {
    id: "9",
    taskNumber: "T-1124131",
    title: "Office Relocation Proposal",
    category: "general",
    status: "rejected",
    priority: "normal",
    assignee: "Priya Sharma",
    createdAt: "2 days ago",
    group: "Operations",
    description:
      "Proposal to move HQ to the riverside district — rejected on budget grounds.",
    assignees: [{ name: "Priya Sharma", initials: "PS", color: "pink" }],
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    tags: [{ label: "Facilities", color: "gray" }],
    requestStatus: "Request Seen.",
    approvalStatus: "Rejected — over budget",
  },
  {
    id: "10",
    taskNumber: "T-1124132",
    title: "Mobile App UI Kit v2",
    category: "document_review",
    status: "ongoing",
    priority: "important",
    assignee: "Achmad Hakim",
    createdAt: "5 hours ago",
    group: "Design",
    description:
      "Second iteration of the mobile component library — all screens complete, ready for review.",
    assignees: [
      { name: "Achmad Hakim", initials: "AH", color: "blue" },
      { name: "Samantha Emanuel", initials: "SE", color: "violet" },
    ],
    startDate: "2026-06-12",
    endDate: "2026-07-08",
    tags: [
      { label: "Design", color: "pink" },
      { label: "Mobile", color: "cyan" },
    ],
    attachments: [
      { name: "UIKit_v2.fig", size: "28.1 Mb", fileType: "fig" },
      { name: "Preview.png", size: "3.2 Mb", fileType: "img" },
    ],
    subtasks: [
      {
        id: "s26",
        title: "Rebuild button variants",
        category: "Components",
        status: "completed",
        dueDate: "June 20, 2026",
      },
      {
        id: "s27",
        title: "Dark mode tokens",
        category: "Theming",
        status: "completed",
        dueDate: "June 30, 2026",
      },
      {
        id: "s28",
        title: "Export handoff specs",
        category: "Handoff",
        status: "completed",
        dueDate: "July 7, 2026",
      },
    ],
  },
  {
    id: "11",
    taskNumber: "T-1124133",
    title: "Expense Report Reconciliation",
    category: "approval",
    status: "hold",
    priority: "normal",
    assignee: "Rafi Andika",
    createdAt: "4 days ago",
    group: "Finance",
    assignees: [{ name: "Rafi Andika", initials: "RA", color: "orange" }],
    startDate: "2026-06-25",
    endDate: "2026-07-15",
    tags: [{ label: "Finance", color: "yellow" }],
    requestStatus: "Request Seen.",
    approvalStatus: "Awaiting receipts",
    subtasks: [
      {
        id: "s29",
        title: "Match receipts to entries",
        category: "Reconciliation",
        status: "in_progress",
        dueDate: "July 8, 2026",
      },
      {
        id: "s30",
        title: "Flag discrepancies",
        category: "Reconciliation",
        status: "pending",
        dueDate: "July 12, 2026",
      },
    ],
  },
  {
    id: "12",
    taskNumber: "T-1124134",
    title: "Social Media Content Calendar — August",
    category: "general",
    status: "inbox",
    priority: "important",
    assignee: "Achmad Hakim",
    createdAt: "1 hour ago",
    group: "Marketing",
    assignees: [
      { name: "Achmad Hakim", initials: "AH", color: "blue" },
      { name: "Priya Sharma", initials: "PS", color: "pink" },
      { name: "Sudhan Grg.", initials: "SG", color: "teal" },
    ],
    startDate: "2026-07-20",
    endDate: "2026-08-15",
    tags: [
      { label: "Marketing", color: "orange" },
      { label: "Content", color: "lime" },
    ],
    subtasks: [
      {
        id: "s31",
        title: "Draft weekly themes",
        category: "Planning",
        status: "pending",
        dueDate: "July 22, 2026",
      },
      {
        id: "s32",
        title: "Assign copywriters",
        category: "Planning",
        status: "pending",
        dueDate: "July 25, 2026",
      },
      {
        id: "s33",
        title: "Schedule posts",
        category: "Execution",
        status: "pending",
        dueDate: "August 1, 2026",
      },
    ],
  },
  {
    id: "13",
    taskNumber: "T-1124135",
    title: "API v3 Breaking Changes Review",
    category: "review",
    status: "ongoing",
    priority: "urgent",
    assignee: "Samantha Emanuel",
    createdAt: "3 hours ago",
    group: "Product",
    description:
      "Review the proposed v3 contract changes and their downstream impact on consumers.",
    assignees: [
      { name: "Samantha Emanuel", initials: "SE", color: "violet" },
      { name: "Rafi Andika", initials: "RA", color: "orange" },
    ],
    startDate: "2026-07-01",
    endDate: "2026-07-14",
    tags: [
      { label: "API", color: "indigo" },
      { label: "Backend", color: "grape" },
    ],
    attachments: [{ name: "v3_spec.pdf", size: "1.9 Mb", fileType: "pdf" }],
    subtasks: [
      {
        id: "s34",
        title: "Diff v2 vs v3 schema",
        category: "Analysis",
        status: "completed",
        dueDate: "July 5, 2026",
      },
      {
        id: "s35",
        title: "Notify affected teams",
        category: "Comms",
        status: "in_progress",
        dueDate: "July 12, 2026",
      },
    ],
  },
  {
    id: "14",
    taskNumber: "T-1124136",
    title: "Third-Party Data Sharing Agreement",
    category: "approval",
    status: "rejected",
    priority: "important",
    assignee: "Sudhan Grg.",
    createdAt: "6 days ago",
    group: "Compliance",
    description:
      "Data sharing terms with the analytics vendor — rejected pending stronger privacy clauses.",
    assignees: [{ name: "Sudhan Grg.", initials: "SG", color: "teal" }],
    startDate: "2026-06-05",
    endDate: "2026-06-28",
    tags: [
      { label: "Compliance", color: "red" },
      { label: "Legal", color: "grape" },
    ],
    requestStatus: "Request Seen.",
    approvalStatus: "Rejected — privacy concerns",
  },
  {
    id: "15",
    taskNumber: "T-1124137",
    title: "Customer Feedback Analysis — Q2",
    category: "general",
    status: "ongoing",
    priority: "normal",
    assignee: "Priya Sharma",
    createdAt: "6 hours ago",
    group: "Support",
    assignees: [{ name: "Priya Sharma", initials: "PS", color: "pink" }],
    startDate: "2026-07-02",
    endDate: "2026-07-20",
    tags: [{ label: "Research", color: "teal" }],
  },
  {
    id: "16",
    taskNumber: "T-1124138",
    title: "Master Services Agreement — Redline",
    category: "document_review",
    status: "hold",
    priority: "urgent",
    assignee: "Achmad Hakim",
    createdAt: "yesterday",
    group: "Legal",
    description:
      "Full redline pass on the MSA before counterparty review — blocked on legal availability.",
    assignees: [
      { name: "Achmad Hakim", initials: "AH", color: "blue" },
      { name: "Samantha Emanuel", initials: "SE", color: "violet" },
      { name: "Rafi Andika", initials: "RA", color: "orange" },
      { name: "Priya Sharma", initials: "PS", color: "pink" },
    ],
    startDate: "2026-06-30",
    endDate: "2026-07-16",
    tags: [
      { label: "Legal", color: "grape" },
      { label: "Contract", color: "indigo" },
    ],
    attachments: [{ name: "MSA_draft.pdf", size: "2.4 Mb", fileType: "pdf" }],
    subtasks: [
      {
        id: "s36",
        title: "Redline liability section",
        category: "Legal",
        status: "completed",
        dueDate: "July 5, 2026",
      },
      {
        id: "s37",
        title: "Review indemnity terms",
        category: "Legal",
        status: "in_progress",
        dueDate: "July 12, 2026",
      },
      {
        id: "s38",
        title: "Counterparty send-off",
        category: "Delivery",
        status: "pending",
        dueDate: "July 16, 2026",
      },
    ],
  },
  {
    id: "17",
    taskNumber: "T-1124139",
    title: "Performance Review Cycle Setup",
    category: "review",
    status: "inbox",
    priority: "normal",
    assignee: "Rafi Andika",
    createdAt: "45 minutes ago",
    group: "HR",
    assignees: [{ name: "Rafi Andika", initials: "RA", color: "orange" }],
    startDate: "2026-07-18",
    endDate: "2026-08-10",
    tags: [{ label: "HR", color: "cyan" }],
    subtasks: [
      {
        id: "s39",
        title: "Configure review templates",
        category: "Setup",
        status: "pending",
        dueDate: "July 20, 2026",
      },
      {
        id: "s40",
        title: "Enroll managers",
        category: "Setup",
        status: "pending",
        dueDate: "July 25, 2026",
      },
    ],
  },
  {
    id: "18",
    taskNumber: "T-1124140",
    title: "Capital Expenditure Request — Servers",
    category: "approval",
    status: "ongoing",
    priority: "important",
    assignee: "Samantha Emanuel",
    createdAt: "8 hours ago",
    group: "Finance",
    description:
      "CapEx request for the new compute cluster — all prep complete, ready for sign-off.",
    assignees: [{ name: "Samantha Emanuel", initials: "SE", color: "violet" }],
    startDate: "2026-06-15",
    endDate: "2026-07-10",
    tags: [{ label: "Finance", color: "yellow" }],
    requestStatus: "Request Seen.",
    approvalStatus: "Ready for final approval",
    subtasks: [
      {
        id: "s41",
        title: "Get three vendor quotes",
        category: "Procurement",
        status: "completed",
        dueDate: "June 25, 2026",
      },
      {
        id: "s42",
        title: "Build ROI model",
        category: "Analysis",
        status: "completed",
        dueDate: "July 5, 2026",
      },
    ],
  },
  {
    id: "19",
    taskNumber: "T-1124141",
    title: "Legacy System Decommission Plan",
    category: "general",
    status: "rejected",
    priority: "normal",
    assignee: "Sudhan Grg.",
    createdAt: "1 week ago",
    group: "IT",
    description:
      "Plan to sunset the old billing system — rejected until data-migration risk is addressed.",
    assignees: [
      { name: "Sudhan Grg.", initials: "SG", color: "teal" },
      { name: "Priya Sharma", initials: "PS", color: "pink" },
    ],
    startDate: "2026-05-15",
    endDate: "2026-06-15",
    tags: [{ label: "Infrastructure", color: "gray" }],
  },
  {
    id: "20",
    taskNumber: "T-1124142",
    title: "Brand Guidelines PDF — Client Y",
    category: "document_review",
    status: "ongoing",
    priority: "normal",
    assignee: "Achmad Hakim",
    createdAt: "2 hours ago",
    group: "Client Projects",
    assignees: [{ name: "Achmad Hakim", initials: "AH", color: "blue" }],
    startDate: "2026-06-28",
    endDate: "2026-07-18",
    tags: [
      { label: "Design", color: "pink" },
      { label: "Client Work", color: "teal" },
    ],
    attachments: [
      { name: "Guidelines.pdf", size: "9.7 Mb", fileType: "pdf" },
      { name: "Logo_pack.fig", size: "5.5 Mb", fileType: "fig" },
    ],
    subtasks: [
      {
        id: "s43",
        title: "Define color system",
        category: "Content",
        status: "completed",
        dueDate: "July 2, 2026",
      },
      {
        id: "s44",
        title: "Write typography rules",
        category: "Content",
        status: "in_progress",
        dueDate: "July 10, 2026",
      },
      {
        id: "s45",
        title: "Assemble final PDF",
        category: "Production",
        status: "pending",
        dueDate: "July 18, 2026",
      },
    ],
  },
  {
    id: "21",
    taskNumber: "T-1124143",
    title: "Rebranding Campaign Assets",
    category: "review",
    status: "hold",
    priority: "important",
    assignee: "Priya Sharma",
    createdAt: "3 days ago",
    group: "Marketing",
    assignees: [
      { name: "Priya Sharma", initials: "PS", color: "pink" },
      { name: "Samantha Emanuel", initials: "SE", color: "violet" },
    ],
    startDate: "2026-06-20",
    endDate: "2026-07-22",
    tags: [
      { label: "Design", color: "pink" },
      { label: "Marketing", color: "orange" },
    ],
    subtasks: [
      {
        id: "s46",
        title: "Collect asset drafts",
        category: "Collection",
        status: "completed",
        dueDate: "July 1, 2026",
      },
      {
        id: "s47",
        title: "Brand consistency check",
        category: "Review",
        status: "in_progress",
        dueDate: "July 15, 2026",
      },
    ],
  },
  {
    id: "22",
    taskNumber: "T-1124144",
    title: "Production Incident Postmortem",
    category: "general",
    status: "inbox",
    priority: "urgent",
    assignee: "Achmad Hakim",
    createdAt: "1 hour ago",
    group: "Engineering",
    description:
      "Document root cause and action items for last night's checkout outage.",
    assignees: [
      { name: "Achmad Hakim", initials: "AH", color: "blue" },
      { name: "Rafi Andika", initials: "RA", color: "orange" },
    ],
    startDate: "2026-07-11",
    endDate: "2026-07-14",
    tags: [{ label: "Incident", color: "red" }],
    subtasks: [
      {
        id: "s48",
        title: "Write timeline of events",
        category: "Analysis",
        status: "pending",
        dueDate: "July 12, 2026",
      },
    ],
  },
  {
    id: "23",
    taskNumber: "T-1124145",
    title: "Warehouse Inventory Audit",
    category: "review",
    status: "ongoing",
    priority: "normal",
    assignee: "Rafi Andika",
    createdAt: "yesterday",
    group: "Operations",
    assignees: [{ name: "Rafi Andika", initials: "RA", color: "orange" }],
    startDate: "2026-07-03",
    endDate: "2026-07-19",
    subtasks: [
      {
        id: "s49",
        title: "Count stock by aisle",
        category: "Execution",
        status: "completed",
        dueDate: "July 8, 2026",
      },
      {
        id: "s50",
        title: "Reconcile against system",
        category: "Analysis",
        status: "in_progress",
        dueDate: "July 15, 2026",
      },
    ],
  },
  {
    id: "24",
    taskNumber: "T-1124146",
    title: "GDPR Data Map Revision",
    category: "document_review",
    status: "rejected",
    priority: "important",
    assignee: "Samantha Emanuel",
    createdAt: "5 days ago",
    group: "Compliance",
    description:
      "Revised data-flow mapping — rejected for missing sub-processor entries.",
    assignees: [{ name: "Samantha Emanuel", initials: "SE", color: "violet" }],
    startDate: "2026-06-10",
    endDate: "2026-07-01",
    tags: [{ label: "Compliance", color: "red" }],
    requestStatus: "Request Seen.",
    approvalStatus: "Rejected — incomplete mapping",
  },
  {
    id: "25",
    taskNumber: "T-1124147",
    title: "Enterprise Deal — Contract Approval",
    category: "approval",
    status: "ongoing",
    priority: "urgent",
    assignee: "Achmad Hakim",
    createdAt: "4 hours ago",
    group: "Sales",
    description:
      "Final approval on the six-figure enterprise contract — all internal checks passed.",
    assignees: [
      { name: "Achmad Hakim", initials: "AH", color: "blue" },
      { name: "Samantha Emanuel", initials: "SE", color: "violet" },
      { name: "Priya Sharma", initials: "PS", color: "pink" },
    ],
    startDate: "2026-06-22",
    endDate: "2026-07-12",
    tags: [
      { label: "Sales", color: "green" },
      { label: "Urgent", color: "red" },
    ],
    attachments: [{ name: "Contract.pdf", size: "3.1 Mb", fileType: "pdf" }],
    requestStatus: "Request Seen.",
    approvalStatus: "Awaiting final approval",
    subtasks: [
      {
        id: "s51",
        title: "Legal review",
        category: "Legal",
        status: "completed",
        dueDate: "July 1, 2026",
      },
      {
        id: "s52",
        title: "Finance sign-off",
        category: "Finance",
        status: "completed",
        dueDate: "July 8, 2026",
      },
    ],
  },
  {
    id: "26",
    taskNumber: "T-1124148",
    title: "Update Team Wiki Documentation",
    category: "general",
    status: "inbox",
    priority: "normal",
    assignee: "Sudhan Grg.",
    createdAt: "10 minutes ago",
    group: "General Tasks",
    assignees: [{ name: "Sudhan Grg.", initials: "SG", color: "teal" }],
  },
  {
    id: "27",
    taskNumber: "T-1124149",
    title: "Feature Flag Cleanup Review",
    category: "review",
    status: "hold",
    priority: "normal",
    assignee: "Priya Sharma",
    createdAt: "2 days ago",
    group: "Product",
    assignees: [{ name: "Priya Sharma", initials: "PS", color: "pink" }],
    startDate: "2026-06-28",
    endDate: "2026-07-17",
    tags: [{ label: "Tech Debt", color: "gray" }],
    subtasks: [
      {
        id: "s53",
        title: "List stale flags",
        category: "Audit",
        status: "completed",
        dueDate: "July 5, 2026",
      },
      {
        id: "s54",
        title: "Confirm safe to remove",
        category: "Review",
        status: "pending",
        dueDate: "July 14, 2026",
      },
    ],
  },
  {
    id: "28",
    taskNumber: "T-1124150",
    title: "Employee Handbook Refresh",
    category: "general",
    status: "ongoing",
    priority: "important",
    assignee: "Rafi Andika",
    createdAt: "1 day ago",
    group: "HR",
    assignees: [
      { name: "Rafi Andika", initials: "RA", color: "orange" },
      { name: "Achmad Hakim", initials: "AH", color: "blue" },
    ],
    startDate: "2026-06-25",
    endDate: "2026-07-25",
    tags: [{ label: "HR", color: "cyan" }],
    subtasks: [
      {
        id: "s55",
        title: "Update leave policy",
        category: "Content",
        status: "completed",
        dueDate: "July 3, 2026",
      },
      {
        id: "s56",
        title: "Add remote-work section",
        category: "Content",
        status: "in_progress",
        dueDate: "July 18, 2026",
      },
    ],
  },
  {
    id: "29",
    taskNumber: "T-1124151",
    title: "Emergency Budget Reallocation",
    category: "approval",
    status: "rejected",
    priority: "urgent",
    assignee: "Samantha Emanuel",
    createdAt: "3 days ago",
    group: "Finance",
    description:
      "Mid-quarter reallocation to cover the cloud overspend — rejected, deferred to Q3 planning.",
    assignees: [{ name: "Samantha Emanuel", initials: "SE", color: "violet" }],
    startDate: "2026-06-18",
    endDate: "2026-06-25",
    tags: [
      { label: "Finance", color: "yellow" },
      { label: "Urgent", color: "red" },
    ],
    requestStatus: "Request Seen.",
    approvalStatus: "Rejected — deferred to Q3",
  },
  {
    id: "30",
    taskNumber: "T-1124152",
    title: "Design System Tokens Spec",
    category: "document_review",
    status: "inbox",
    priority: "important",
    assignee: "Achmad Hakim",
    createdAt: "25 minutes ago",
    group: "Design",
    assignees: [{ name: "Achmad Hakim", initials: "AH", color: "blue" }],
    startDate: "2026-07-15",
    endDate: "2026-08-05",
    tags: [
      { label: "Design", color: "pink" },
      { label: "Design System", color: "violet" },
    ],
    attachments: [{ name: "Tokens.fig", size: "6.8 Mb", fileType: "fig" }],
    subtasks: [
      {
        id: "s57",
        title: "Define spacing scale",
        category: "Spec",
        status: "pending",
        dueDate: "July 18, 2026",
      },
      {
        id: "s58",
        title: "Define color roles",
        category: "Spec",
        status: "pending",
        dueDate: "July 22, 2026",
      },
      {
        id: "s59",
        title: "Document usage",
        category: "Docs",
        status: "pending",
        dueDate: "August 1, 2026",
      },
    ],
  },
  {
    id: "31",
    taskNumber: "T-1124153",
    title: "Database Migration Dry Run",
    category: "review",
    status: "ongoing",
    priority: "normal",
    assignee: "Sudhan Grg.",
    createdAt: "7 hours ago",
    group: "Engineering",
    description:
      "Rehearse the Postgres 15 → 17 migration against a staging clone.",
    assignees: [
      { name: "Sudhan Grg.", initials: "SG", color: "teal" },
      { name: "Rafi Andika", initials: "RA", color: "orange" },
    ],
    startDate: "2026-07-04",
    endDate: "2026-07-16",
    tags: [{ label: "Backend", color: "grape" }],
    attachments: [
      { name: "migration_plan.txt", size: "42 Kb", fileType: "other" },
    ],
    subtasks: [
      {
        id: "s60",
        title: "Snapshot staging DB",
        category: "Prep",
        status: "completed",
        dueDate: "July 8, 2026",
      },
      {
        id: "s61",
        title: "Run migration script",
        category: "Execution",
        status: "in_progress",
        dueDate: "July 14, 2026",
      },
    ],
  },
  {
    id: "32",
    taskNumber: "T-1124154",
    title: "Vendor Onboarding — Logistics Partner",
    category: "general",
    status: "hold",
    priority: "urgent",
    assignee: "Priya Sharma",
    createdAt: "2 days ago",
    group: "Operations",
    assignees: [
      { name: "Priya Sharma", initials: "PS", color: "pink" },
      { name: "Samantha Emanuel", initials: "SE", color: "violet" },
      { name: "Achmad Hakim", initials: "AH", color: "blue" },
    ],
    startDate: "2026-06-27",
    endDate: "2026-07-15",
    tags: [{ label: "Vendor", color: "indigo" }],
    subtasks: [
      {
        id: "s62",
        title: "Collect compliance docs",
        category: "Onboarding",
        status: "in_progress",
        dueDate: "July 10, 2026",
      },
      {
        id: "s63",
        title: "Set up payment terms",
        category: "Finance",
        status: "pending",
        dueDate: "July 14, 2026",
      },
    ],
  },
  {
    id: "33",
    taskNumber: "T-1124155",
    title: "Software License Renewal Approval",
    category: "approval",
    status: "inbox",
    priority: "normal",
    assignee: "Rafi Andika",
    createdAt: "3 hours ago",
    group: "IT",
    assignees: [{ name: "Rafi Andika", initials: "RA", color: "orange" }],
    startDate: "2026-07-14",
    endDate: "2026-07-28",
    tags: [{ label: "Procurement", color: "gray" }],
    requestStatus: "Request Unseen.",
    approvalStatus: "Awaiting approval",
    subtasks: [
      {
        id: "s64",
        title: "Confirm seat count",
        category: "Prep",
        status: "pending",
        dueDate: "July 16, 2026",
      },
    ],
  },
  {
    id: "34",
    taskNumber: "T-1124156",
    title: "Client Z Proposal Deck",
    category: "document_review",
    status: "ongoing",
    priority: "important",
    assignee: "Achmad Hakim",
    createdAt: "9 hours ago",
    group: "Client Projects",
    description:
      "Pitch deck for the Client Z engagement — content locked, ready for partner review.",
    assignees: [
      { name: "Achmad Hakim", initials: "AH", color: "blue" },
      { name: "Priya Sharma", initials: "PS", color: "pink" },
    ],
    startDate: "2026-06-24",
    endDate: "2026-07-09",
    tags: [{ label: "Client Work", color: "teal" }],
    attachments: [
      { name: "Proposal.pdf", size: "7.3 Mb", fileType: "pdf" },
      { name: "Cover.png", size: "1.1 Mb", fileType: "img" },
    ],
    subtasks: [
      {
        id: "s65",
        title: "Draft narrative",
        category: "Content",
        status: "completed",
        dueDate: "June 30, 2026",
      },
      {
        id: "s66",
        title: "Design slides",
        category: "Design",
        status: "completed",
        dueDate: "July 6, 2026",
      },
    ],
  },
  {
    id: "35",
    taskNumber: "T-1124157",
    title: "Chatbot Integration Spike",
    category: "general",
    status: "rejected",
    priority: "normal",
    assignee: "Sudhan Grg.",
    createdAt: "4 days ago",
    group: "Support",
    description:
      "Feasibility spike for an AI support chatbot — rejected, revisit after the CRM migration.",
    assignees: [{ name: "Sudhan Grg.", initials: "SG", color: "teal" }],
    startDate: "2026-06-12",
    endDate: "2026-06-26",
    tags: [{ label: "Research", color: "teal" }],
  },
  {
    id: "36",
    taskNumber: "T-1124158",
    title: "Newsletter Template Overhaul",
    category: "general",
    status: "ongoing",
    priority: "normal",
    assignee: "Samantha Emanuel",
    createdAt: "5 hours ago",
    group: "Marketing",
    assignees: [{ name: "Samantha Emanuel", initials: "SE", color: "violet" }],
    startDate: "2026-07-01",
    endDate: "2026-07-21",
    tags: [{ label: "Marketing", color: "orange" }],
  },
  {
    id: "37",
    taskNumber: "T-1124159",
    title: "NDA Batch Processing",
    category: "document_review",
    status: "hold",
    priority: "important",
    assignee: "Rafi Andika",
    createdAt: "1 day ago",
    group: "Legal",
    assignees: [
      { name: "Rafi Andika", initials: "RA", color: "orange" },
      { name: "Priya Sharma", initials: "PS", color: "pink" },
    ],
    startDate: "2026-06-29",
    endDate: "2026-07-18",
    tags: [{ label: "Legal", color: "grape" }],
    subtasks: [
      {
        id: "s67",
        title: "Template standard NDA",
        category: "Prep",
        status: "completed",
        dueDate: "July 4, 2026",
      },
      {
        id: "s68",
        title: "Process pending signatures",
        category: "Execution",
        status: "in_progress",
        dueDate: "July 15, 2026",
      },
    ],
  },
  {
    id: "38",
    taskNumber: "T-1124160",
    title: "Roadmap Prioritization Review",
    category: "review",
    status: "inbox",
    priority: "urgent",
    assignee: "Achmad Hakim",
    createdAt: "20 minutes ago",
    group: "Product",
    description:
      "Score the Q4 initiative backlog and lock the top-line roadmap for the quarter.",
    assignees: [{ name: "Achmad Hakim", initials: "AH", color: "blue" }],
    startDate: "2026-07-12",
    endDate: "2026-07-26",
    tags: [
      { label: "Product", color: "blue" },
      { label: "Planning", color: "cyan" },
    ],
    subtasks: [
      {
        id: "s69",
        title: "Score initiatives",
        category: "Prioritization",
        status: "pending",
        dueDate: "July 16, 2026",
      },
      {
        id: "s70",
        title: "Align with leadership",
        category: "Alignment",
        status: "pending",
        dueDate: "July 22, 2026",
      },
    ],
  },
  {
    id: "39",
    taskNumber: "T-1124161",
    title: "Year-End Financial Close",
    category: "approval",
    status: "ongoing",
    priority: "urgent",
    assignee: "Samantha Emanuel",
    createdAt: "6 hours ago",
    group: "Finance",
    description:
      "Close the books for the fiscal year and prepare statements for the external audit.",
    assignees: [
      { name: "Samantha Emanuel", initials: "SE", color: "violet" },
      { name: "Rafi Andika", initials: "RA", color: "orange" },
    ],
    startDate: "2026-07-01",
    endDate: "2026-07-31",
    tags: [
      { label: "Finance", color: "yellow" },
      { label: "Urgent", color: "red" },
    ],
    attachments: [
      { name: "Ledger_export.pdf", size: "5.9 Mb", fileType: "pdf" },
    ],
    requestStatus: "Request Seen.",
    approvalStatus: "In progress",
    subtasks: [
      {
        id: "s71",
        title: "Reconcile all accounts",
        category: "Reconciliation",
        status: "completed",
        dueDate: "July 12, 2026",
      },
      {
        id: "s72",
        title: "Prepare audit package",
        category: "Reporting",
        status: "in_progress",
        dueDate: "July 25, 2026",
      },
      {
        id: "s73",
        title: "Controller sign-off",
        category: "Approval",
        status: "pending",
        dueDate: "July 31, 2026",
      },
    ],
  },
  {
    id: "40",
    taskNumber: "T-1124162",
    title: "ISO 27001 Gap Assessment",
    category: "review",
    status: "rejected",
    priority: "important",
    assignee: "Priya Sharma",
    createdAt: "1 week ago",
    group: "Compliance",
    description:
      "Initial gap assessment against ISO 27001 controls — rejected, scope too narrow for certification.",
    assignees: [{ name: "Priya Sharma", initials: "PS", color: "pink" }],
    startDate: "2026-05-20",
    endDate: "2026-06-20",
    tags: [
      { label: "Compliance", color: "red" },
      { label: "Security", color: "red" },
    ],
  },
];

// Treated as the signed-in user for the "My Board" filter in this mock data.
export const CURRENT_USER_NAME = "Achmad Hakim";

// Groups treated as the current user's department for the "Department Board" filter.
const DEPARTMENT_GROUPS = [
  "Client Projects",
  "Design",
  "Product",
  "Engineering",
];

// ---------------------------------------------------------------------------
// In-memory store (mock backend)
//
// `MOCK_TASKS` above is the immutable seed. `taskStore` is the mutable working
// set the CRUD helpers read and write, so create / edit / delete / reorder
// persist for the browser session (until a full reload re-seeds from the mock).
// ---------------------------------------------------------------------------

let taskStore: Task[] = MOCK_TASKS.map((t) => ({ ...t }));

const MOCK_LATENCY = 200;
const delay = () => new Promise((r) => setTimeout(r, MOCK_LATENCY));

export async function fetchTasks(filter: TaskBoardFilter): Promise<Task[]> {
  await delay();
  switch (filter) {
    case "mine":
      return taskStore.filter(
        (t) =>
          t.assignee === CURRENT_USER_NAME ||
          t.assignees?.some((a) => a.name === CURRENT_USER_NAME),
      );
    case "team":
      return taskStore.filter((t) => (t.assignees?.length ?? 0) > 1);
    case "department":
      return taskStore.filter((t) => DEPARTMENT_GROUPS.includes(t.group));
    case "all":
    default:
      return taskStore.slice();
  }
}

// Recency rank parsed from the human `createdAt` label, in "minutes ago"
// (smaller = newer). Lets the Created sort order real tasks without a stored
// timestamp; freshly created tasks use "just now" and rank at the top.
const AGE_UNIT_MINUTES: Record<string, number> = {
  minute: 1,
  hour: 60,
  day: 60 * 24,
  week: 60 * 24 * 7,
  month: 60 * 24 * 30,
  year: 60 * 24 * 365,
};

export function createdRank(task: Task): number {
  const label = task.createdAt.trim().toLowerCase();
  if (label === "just now") return 0;
  if (label === "yesterday") return AGE_UNIT_MINUTES.day;
  const match = label.match(
    /^(\d+|an?)\s+(minute|hour|day|week|month|year)s?\s+ago$/,
  );
  if (!match) return Number.MAX_SAFE_INTEGER;
  const qty = match[1] === "a" || match[1] === "an" ? 1 : Number(match[1]);
  return qty * AGE_UNIT_MINUTES[match[2]];
}

export interface TaskInput {
  title: string;
  status: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  assigneeNames: string[];
  startDate?: string | null;
  endDate?: string | null;
  tags?: TaskTag[];
  description?: string;
  group?: string;
  subtasks?: TaskSubtask[];
}

// Resolve display avatars from team-member names, falling back to derived
// initials for names not in the roster.
function buildAssignees(names: string[]): TaskAssignee[] {
  return names.map((name) => {
    const member = TEAM_MEMBERS.find((m) => m.name === name);
    if (member) {
      return { name, initials: member.initials, color: member.color };
    }
    const initials = name
      .split(/\s+/)
      .map((part) => part[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return { name, initials, color: "gray" };
  });
}

let taskSeq = MOCK_TASKS.length;

export async function createTask(input: TaskInput): Promise<Task> {
  await delay();
  taskSeq += 1;
  const assignees = buildAssignees(input.assigneeNames);
  const task: Task = {
    id: `t-${taskSeq}`,
    taskNumber: `T-${1124162 + taskSeq}`,
    title: input.title.trim(),
    category: input.category ?? "general",
    status: input.status,
    priority: input.priority ?? "normal",
    assignee: assignees[0]?.name ?? "Unassigned",
    createdAt: "just now",
    group: input.group ?? "General Tasks",
    description: input.description?.trim() || undefined,
    assignees: assignees.length ? assignees : undefined,
    startDate: input.startDate ?? undefined,
    endDate: input.endDate ?? undefined,
    tags: input.tags?.length ? input.tags : undefined,
    subtasks: input.subtasks?.length ? input.subtasks : undefined,
  };
  taskStore = [task, ...taskStore];
  return task;
}

// Full replace of the form-owned fields: title/status/assignees/dates/tags/
// description are taken straight from the input, so clearing them (empty
// assignees, null dates, blank description) actually clears. priority, category
// and subtasks aren't in the base form yet, so they fall back to the existing
// value when the input omits them.
export async function updateTask(id: string, patch: TaskInput): Promise<Task> {
  await delay();
  const assignees = buildAssignees(patch.assigneeNames);
  let updated: Task | undefined;
  taskStore = taskStore.map((t) => {
    if (t.id !== id) return t;
    updated = {
      ...t,
      title: patch.title.trim(),
      status: patch.status,
      priority: patch.priority ?? t.priority,
      category: patch.category ?? t.category,
      assignee: assignees[0]?.name ?? "Unassigned",
      assignees: assignees.length ? assignees : undefined,
      startDate: patch.startDate ?? undefined,
      endDate: patch.endDate ?? undefined,
      tags: patch.tags?.length ? patch.tags : undefined,
      description: patch.description?.trim() || undefined,
      subtasks: patch.subtasks ?? t.subtasks,
    };
    return updated;
  });
  if (!updated) throw new Error(`Task ${id} not found`);
  return updated;
}

export async function deleteTask(id: string): Promise<void> {
  await delay();
  taskStore = taskStore.filter((t) => t.id !== id);
}

export async function setTaskStatus(
  id: string,
  status: TaskStatus,
): Promise<void> {
  await delay();
  taskStore = taskStore.map((t) => (t.id === id ? { ...t, status } : t));
}

// Shallow field patch for inline row edits (priority / list / due date).
export async function patchTask(
  id: string,
  patch: Partial<Task>,
): Promise<void> {
  await delay();
  taskStore = taskStore.map((t) => (t.id === id ? { ...t, ...patch } : t));
}

export async function reorderTasks(
  activeId: string,
  overId: string,
): Promise<void> {
  await delay();
  const from = taskStore.findIndex((t) => t.id === activeId);
  const to = taskStore.findIndex((t) => t.id === overId);
  if (from === -1 || to === -1) return;
  const next = taskStore.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  taskStore = next;
}
