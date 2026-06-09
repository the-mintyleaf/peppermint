import { v4 as uuidv4 } from "uuid";

export type AutomationStatus = "running" | "scheduled" | "paused" | "error" | "idle";
export type NodeType = "trigger" | "fetch" | "ai" | "template" | "branch" | "condition" | "output";
export type NodeStatus = "ok" | "running" | "pending" | "error" | "skipped";
export type RunStatus = "success" | "partial" | "failed" | "running";
export type ScheduleType = "cron" | "interval" | "manual";

export interface AutomationSchedule {
  type: ScheduleType;
  cron?: string;
  interval?: number;
  intervalUnit?: "minutes" | "hours";
  timezone?: string;
}

export interface AutomationNode {
  id: string;
  type: NodeType;
  label: string;
  status: NodeStatus;
  meta?: Record<string, unknown>;
  position?: { x: number; y: number };
}

export interface AutomationEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface Automation extends Record<string, unknown> {
  id: string;
  name: string;
  description: string;
  status: AutomationStatus;
  lastRunAt?: string;
  lastRunStatus?: "success" | "partial" | "failed";
  nextRunAt?: string;
  schedule?: AutomationSchedule;
  nodes?: AutomationNode[];
  edges?: AutomationEdge[];
}

export interface RunStep {
  nodeId: string;
  nodeLabel: string;
  status: string;
  duration?: number;
  error?: string;
}

export interface Run extends Record<string, unknown> {
  id: string;
  automationId: string;
  startedAt: string;
  endedAt?: string;
  status: RunStatus;
  stepsTotal: number;
  stepsCompleted: number;
  steps?: RunStep[];
}

export interface AutomationsResponse {
  data: Automation[];
  meta: { total: number; page: number; pageSize: number };
}

export interface RunsResponse {
  data: Run[];
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK_NODES: AutomationNode[] = [
  { id: "n1", type: "trigger", label: "Schedule Trigger", status: "ok", position: { x: 0, y: 100 } },
  { id: "n2", type: "fetch", label: "Fetch Brand Assets", status: "ok", position: { x: 200, y: 50 } },
  { id: "n3", type: "ai", label: "Generate Copy", status: "ok", position: { x: 200, y: 150 } },
  { id: "n4", type: "template", label: "Apply Template", status: "ok", position: { x: 400, y: 100 }, meta: { template_id: "tmpl_1", template_name: "Instagram Square v2" } },
  { id: "n5", type: "branch", label: "Platform Branch", status: "ok", position: { x: 600, y: 100 } },
  { id: "n6", type: "output", label: "Publish Instagram", status: "ok", position: { x: 800, y: 50 } },
  { id: "n7", type: "output", label: "Publish LinkedIn", status: "ok", position: { x: 800, y: 150 } },
];

const MOCK_EDGES: AutomationEdge[] = [
  { id: "e1", from: "n1", to: "n2" },
  { id: "e2", from: "n1", to: "n3" },
  { id: "e3", from: "n2", to: "n4" },
  { id: "e4", from: "n3", to: "n4" },
  { id: "e5", from: "n4", to: "n5" },
  { id: "e6", from: "n5", to: "n6", label: "instagram" },
  { id: "e7", from: "n5", to: "n7", label: "linkedin" },
];

let mockAutomations: Automation[] = [
  {
    id: "auto_1",
    name: "Weekly Instagram Post",
    description: "Generates and publishes one Instagram post every Monday at 9am",
    status: "scheduled",
    lastRunAt: new Date(Date.now() - 7 * 86_400_000).toISOString(),
    lastRunStatus: "success",
    nextRunAt: new Date(Date.now() + 2 * 86_400_000).toISOString(),
    schedule: { type: "cron", cron: "0 9 * * 1", timezone: "UTC" },
  },
  {
    id: "auto_2",
    name: "LinkedIn Article",
    description: "Publishes a long-form article to LinkedIn on the first Monday of each month",
    status: "paused",
    lastRunAt: new Date(Date.now() - 14 * 86_400_000).toISOString(),
    lastRunStatus: "partial",
    schedule: { type: "cron", cron: "0 10 1 * *", timezone: "UTC" },
  },
  {
    id: "auto_3",
    name: "Twitter Daily",
    description: "Posts a daily tweet with trending content",
    status: "error",
    lastRunAt: new Date(Date.now() - 86_400_000).toISOString(),
    lastRunStatus: "failed",
    nextRunAt: new Date(Date.now() + 3_600_000).toISOString(),
    schedule: { type: "cron", cron: "0 8 * * *", timezone: "UTC" },
  },
  {
    id: "auto_4",
    name: "TikTok Weekly",
    description: "Creates short-form video scripts and posts to TikTok",
    status: "idle",
    lastRunAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    lastRunStatus: "success",
    schedule: { type: "manual" },
  },
];

const mockRunsMap: Record<string, Run[]> = {
  auto_1: Array.from({ length: 10 }, (_, i) => ({
    id: `run_${i + 1}`,
    automationId: "auto_1",
    startedAt: new Date(Date.now() - (i + 1) * 7 * 86_400_000).toISOString(),
    endedAt: new Date(Date.now() - (i + 1) * 7 * 86_400_000 + 120_000).toISOString(),
    status: i === 2 ? "failed" : "success",
    stepsTotal: 7,
    stepsCompleted: i === 2 ? 4 : 7,
    steps: MOCK_NODES.map((n) => ({
      nodeId: n.id,
      nodeLabel: n.label,
      status: i === 2 && ["n5", "n6", "n7"].includes(n.id) ? "error" : "success",
      duration: Math.floor(Math.random() * 20) + 2,
      error: i === 2 && n.id === "n5" ? "Branch condition timeout" : undefined,
    })),
  })),
};

// ─── API functions ─────────────────────────────────────────────────────────

export async function fetchAutomations(filter?: { status?: string }): Promise<AutomationsResponse> {
  await new Promise((r) => setTimeout(r, 350));
  let results = [...mockAutomations];
  if (filter?.status) results = results.filter((a) => a.status === filter.status);
  return { data: results, meta: { total: results.length, page: 1, pageSize: 50 } };
}

export async function fetchAutomation(id: string): Promise<Automation> {
  await new Promise((r) => setTimeout(r, 250));
  const found = mockAutomations.find((a) => a.id === id);
  if (!found) throw new Error("Automation not found");
  return { ...found, nodes: MOCK_NODES, edges: MOCK_EDGES };
}

export async function runAutomation(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 400));
  mockAutomations = mockAutomations.map((a) =>
    a.id === id ? { ...a, status: "running" as AutomationStatus } : a
  );
}

export async function pauseAutomation(id: string, pause: boolean): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
  mockAutomations = mockAutomations.map((a) =>
    a.id === id ? { ...a, status: pause ? ("paused" as AutomationStatus) : ("scheduled" as AutomationStatus) } : a
  );
}

export async function updateSchedule(id: string, schedule: AutomationSchedule): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
  mockAutomations = mockAutomations.map((a) =>
    a.id === id ? { ...a, schedule } : a
  );
}

export async function fetchRuns(automationId: string): Promise<RunsResponse> {
  await new Promise((r) => setTimeout(r, 300));
  return { data: mockRunsMap[automationId] ?? [] };
}
