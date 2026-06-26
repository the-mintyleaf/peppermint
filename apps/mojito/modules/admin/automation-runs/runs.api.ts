import { delay, paginate, PaginatedResponse } from "../shared/mock.utils";
import type { AutomationRun, AutomationStep } from "../shared/entities.types";
import { v4 as uuidv4 } from "uuid";

function makeSteps(status: AutomationRun["status"]): AutomationStep[] {
  const steps: AutomationStep[] = [
    {
      id: uuidv4(),
      label: "Trigger",
      status: "succeeded",
      startedAt: new Date(Date.now() - 30000),
      finishedAt: new Date(Date.now() - 29000),
    },
    {
      id: uuidv4(),
      label: "Generate Content",
      status: status === "failed" ? "failed" : "succeeded",
      log: status === "failed" ? "API timeout after 30s" : undefined,
      startedAt: new Date(Date.now() - 28000),
      finishedAt: new Date(Date.now() - 20000),
    },
    {
      id: uuidv4(),
      label: "Review Gate",
      status:
        status === "waiting_review"
          ? "pending"
          : status === "running"
            ? "running"
            : "succeeded",
      startedAt: new Date(Date.now() - 19000),
    },
    {
      id: uuidv4(),
      label: "Publish",
      status: status === "succeeded" ? "succeeded" : "pending",
    },
  ];
  return steps;
}

let runsStore: AutomationRun[] = [
  ...Array.from(
    { length: 2 },
    (_, i): AutomationRun => ({
      id: `run_running_${i}`,
      workflowId: `wf_${i % 3}`,
      status: "running",
      steps: makeSteps("running"),
      producedContentIds: [],
      startedAt: new Date(Date.now() - 5 * 60 * 1000),
    }),
  ),
  ...Array.from(
    { length: 2 },
    (_, i): AutomationRun => ({
      id: `run_waiting_${i}`,
      workflowId: `wf_${(i + 1) % 3}`,
      status: "waiting_review",
      steps: makeSteps("waiting_review"),
      producedContentIds: [`content_mock_${i}`],
      startedAt: new Date(Date.now() - 15 * 60 * 1000),
    }),
  ),
  ...Array.from(
    { length: 8 },
    (_, i): AutomationRun => ({
      id: `run_succeeded_${i}`,
      workflowId: `wf_${i % 3}`,
      status: "succeeded",
      steps: makeSteps("succeeded"),
      producedContentIds: [`content_mock_${i + 10}`],
      startedAt: new Date(Date.now() - (i + 1) * 2 * 60 * 60 * 1000),
      finishedAt: new Date(
        Date.now() - (i + 1) * 2 * 60 * 60 * 1000 + 5 * 60 * 1000,
      ),
    }),
  ),
  ...Array.from(
    { length: 3 },
    (_, i): AutomationRun => ({
      id: `run_failed_${i}`,
      workflowId: `wf_${i % 3}`,
      status: "failed",
      steps: makeSteps("failed"),
      producedContentIds: [],
      startedAt: new Date(Date.now() - (i + 3) * 3 * 60 * 60 * 1000),
      finishedAt: new Date(
        Date.now() - (i + 3) * 3 * 60 * 60 * 1000 + 1 * 60 * 1000,
      ),
    }),
  ),
];

const WORKFLOW_NAMES: Record<string, string> = {
  wf_0: "Weekly Instagram Digest",
  wf_1: "LinkedIn Article Generator",
  wf_2: "Twitter Daily Engagement",
};

export type RunsFilter = {
  status?: AutomationRun["status"];
  page?: number;
  pageSize?: number;
};

export async function fetchRuns(
  params?: RunsFilter,
): Promise<PaginatedResponse<AutomationRun & { workflowName: string }>> {
  await delay(300);
  let filtered = runsStore;
  if (params?.status) {
    filtered = filtered.filter((r) => r.status === params.status);
  }
  filtered = [...filtered].sort(
    (a, b) => b.startedAt.getTime() - a.startedAt.getTime(),
  );
  const paginated = paginate(
    filtered,
    params?.page ?? 1,
    params?.pageSize ?? 20,
  );
  return {
    ...paginated,
    data: paginated.data.map((r) => ({
      ...r,
      workflowName: WORKFLOW_NAMES[r.workflowId] ?? r.workflowId,
    })),
  };
}

export async function fetchRun(
  id: string,
): Promise<AutomationRun & { workflowName: string }> {
  await delay(200);
  const run = runsStore.find((r) => r.id === id);
  if (!run) throw new Error(`Run ${id} not found`);
  return {
    ...run,
    workflowName: WORKFLOW_NAMES[run.workflowId] ?? run.workflowId,
  };
}

export async function approveGate(runId: string): Promise<AutomationRun> {
  await delay(300);
  const idx = runsStore.findIndex((r) => r.id === runId);
  if (idx === -1) throw new Error("Run not found");
  runsStore[idx] = { ...runsStore[idx], status: "running" };
  return runsStore[idx];
}

export async function retryRun(runId: string): Promise<AutomationRun> {
  await delay(300);
  const idx = runsStore.findIndex((r) => r.id === runId);
  if (idx === -1) throw new Error("Run not found");
  runsStore[idx] = {
    ...runsStore[idx],
    status: "running",
    finishedAt: undefined,
  };
  return runsStore[idx];
}

export async function cancelRun(runId: string): Promise<AutomationRun> {
  await delay(300);
  const idx = runsStore.findIndex((r) => r.id === runId);
  if (idx === -1) throw new Error("Run not found");
  runsStore[idx] = {
    ...runsStore[idx],
    status: "failed",
    finishedAt: new Date(),
  };
  return runsStore[idx];
}

// TODO(backend): replace in-memory store with real run monitoring API
