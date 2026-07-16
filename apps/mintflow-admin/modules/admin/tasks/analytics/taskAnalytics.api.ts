import type { TaskAnalyticsDashboardData } from "./taskAnalytics.types";
import { ANALYTICS_COLORS } from "./taskAnalytics.styles";

const MOCK_DASHBOARD: TaskAnalyticsDashboardData = {
  scheduleDays: [
    { date: 13, label: "13", dayName: "Mon" },
    { date: 14, label: "14", dayName: "Tue" },
    { date: 15, label: "15", dayName: "Wed" },
    { date: 16, label: "16", dayName: "Thu" },
    { date: 17, label: "17", dayName: "Mon" },
  ],
  scheduledTasks: [
    {
      id: "sched-1",
      title: "Product design revision",
      category: "Packaging",
      categoryFilter: "daily_task",
      color: ANALYTICS_COLORS.cardOrange,
      dayIndex: 0,
      startHour: 10,
      endHour: 11.5,
      assignees: [
        { name: "Henky A.", initials: "HA", color: "orange" },
        { name: "Albert R.", initials: "AR", color: "violet" },
      ],
      taskNumber: "T-2001001",
    },
    {
      id: "sched-2",
      title: "Mavence web",
      category: "Project",
      categoryFilter: "task",
      color: ANALYTICS_COLORS.cardPurple,
      dayIndex: 1,
      startHour: 10.5,
      endHour: 13,
      assignees: [{ name: "Richard L.", initials: "RL", color: "blue" }],
      checklist: ["Research", "Wireframe", "UI Design", "Review"],
      progress: 65,
      taskNumber: "T-2001002",
    },
    {
      id: "sched-3",
      title: "Brainstorming new project",
      category: "Design thinking",
      categoryFilter: "urgent",
      color: ANALYTICS_COLORS.cardPink,
      dayIndex: 2,
      startHour: 11,
      endHour: 12.5,
      assignees: [
        { name: "Sudhan G.", initials: "SG", color: "pink" },
        { name: "Anamol M.", initials: "AM", color: "teal" },
      ],
      actionLabel: "Join now",
      taskNumber: "T-2001003",
    },
    {
      id: "sched-4",
      title: "Create new character for packaging",
      category: "Illustration",
      categoryFilter: "reminders",
      color: ANALYTICS_COLORS.cardYellow,
      dayIndex: 3,
      startHour: 12,
      endHour: 14,
      assignees: [{ name: "Henky A.", initials: "HA", color: "orange" }],
      taskNumber: "T-2001004",
    },
    {
      id: "sched-5",
      title: "Website wireframe task",
      category: "Project",
      categoryFilter: "task",
      color: ANALYTICS_COLORS.accentPurple,
      dayIndex: 4,
      startHour: 13,
      endHour: 15,
      assignees: [
        { name: "Albert R.", initials: "AR", color: "violet" },
        { name: "Richard L.", initials: "RL", color: "blue" },
      ],
      taskNumber: "T-2001005",
    },
  ],
  featuredTask: {
    id: "featured-1",
    timeRange: "12.00 - 15.30",
    duration: "48 min",
    title: "Meet Nadhim at Gramedia today.",
  },
  categories: [
    { id: "urgent", label: "Urgent" },
    { id: "daily_task", label: "Daily Task", count: 5, defaultChecked: true },
    { id: "task", label: "Task" },
    { id: "reminders", label: "Reminders", count: 9 },
  ],
  productivity: [
    { day: "Mon", hours: 12, assigned: 18, completed: 14 },
    { day: "Tue", hours: 14, assigned: 20, completed: 16 },
    { day: "Wed", hours: 10, assigned: 15, completed: 12 },
    { day: "Thu", hours: 18.6, assigned: 24, completed: 18 },
    { day: "Fri", hours: 11, assigned: 16, completed: 13 },
    { day: "Sat", hours: 8, assigned: 10, completed: 8 },
    { day: "Sun", hours: 9, assigned: 12, completed: 10 },
  ],
  archiveProjects: [
    {
      id: "arch-1",
      name: "Zentra-Landing.framer",
      app: "framer",
      appColor: "#0055FF",
    },
    {
      id: "arch-2",
      name: "Mavence landing.fig",
      app: "figma",
      appColor: "#F24E1E",
    },
    {
      id: "arch-3",
      name: "orbitlabs.webflow",
      app: "webflow",
      appColor: "#4353FF",
    },
    {
      id: "arch-4",
      name: "PulseApp Styleguide.fig",
      app: "figma",
      appColor: "#F24E1E",
    },
  ],
  teamMembers: [
    { name: "Sudhan G.", initials: "SG", color: "blue" },
    { name: "Henky A.", initials: "HA", color: "orange" },
    { name: "Albert R.", initials: "AR", color: "violet" },
  ],
  selectedPeriodTaskCount: 45,
};

export async function fetchTaskAnalyticsDashboard(
  _month: string,
): Promise<TaskAnalyticsDashboardData> {
  await new Promise((r) => setTimeout(r, 200));
  return MOCK_DASHBOARD;
}
