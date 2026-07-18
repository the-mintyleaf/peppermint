# Not-Contained — Build Guide (reporting / info-card pages)

> Read this after the router (`SKILL.md`) has classified the page as **Not-Contained**.
> A page is Not-Contained **only** when it is a reporting page (charts, KPIs, analytics
> with no CRUD) or a page composed entirely of information cards (a status overview, a
> settings summary made of info panels). A _list of records_ — even a list of cards — is
> **Contained**; go back to the router if you are unsure.

Not-Contained pages **do not** use the admin shells (`ModalTableShell`, `DataTableShell`,
`FormShell`). They are regular Next.js modules built to the standard Component Structure
(`.claude/CLAUDE.md` → Component Structure). Everything data-driven still goes through
React Query — the "no shell" freedom does not relax the stack rules.

## What still applies (do not skip)

- **Module type** — this is a `ContainedModule`-shaped folder in the routing sense (one
  view, its own route) but with **no CRUD shell**. Pick `ContainedModule` or, if it owns
  several routes, `MultiPageModule` for the _routing_ shape; "Not-Contained" only means
  "no admin table/form shell inside."
- **Data via `useQuery`** — never fetch in `useEffect`, never call Axios in an event
  handler. Query fns live in `<Module>.hooks.ts` (or a `queries/` folder when shared).
  Query keys via `createQueryKeys` from `@peppermint/admin`, colocated with the query fn.
- **Charts** — import from the **subpath** `@peppermint/ui/charts`, never from the main
  `@peppermint/ui` barrel (heavy Mantine domains are opt-in subpath exports) and never
  from `@mantine/charts` directly.
- **All UI states** — loading (skeleton), empty (no data yet), error, success. A
  reporting page with no empty/error state is incomplete (`STANDARDS.md`).
- **Error boundary** — wrap the module content in `ModuleErrorBoundary` (from
  `@peppermint/admin`, `src/feedback`) with `resetKeys`, exactly as shell modules do.
- **Container** — use `<ModalPaper withBorder>` (from `@peppermint/ui`) when the page
  wants the same framed, full-height container the shells use; a free-form dashboard that
  manages its own layout may skip it.
- **Styling / icons / a11y** — same rules: `@peppermint/ui` only, Phosphor icons with
  `aria-label`, design tokens (no raw hex / arbitrary spacing), semantic HTML.

## File structure (reporting example)

```
modules/admin/
└── analytics/
    ├── index.ts                     # exports ModuleAnalytics (single named export)
    ├── Analytics.tsx                # composes the page (client component)
    ├── Analytics.types.ts           # KPI / chart-datum types + props
    ├── Analytics.hooks.ts           # useQuery hooks + query keys
    ├── Analytics.api.ts             # fetch functions (typed)
    ├── Analytics.module.css         # only if Mantine props/style can't express it
    ├── components/                  # sub-cards when the page > ~200 lines or reused
    │   ├── KpiCard/
    │   └── RevenueChartCard/
    └── docs/AI.md                   # mandatory nav map
```

## Step 1 — `Analytics.api.ts` + `Analytics.hooks.ts`

```ts
// Analytics.api.ts
import { api } from "@/lib/api";
import type { AnalyticsSummary } from "./Analytics.types";

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  return api.get("/api/v1/analytics/summary");
}
```

```ts
// Analytics.hooks.ts
import { useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "@peppermint/admin";
import { fetchAnalyticsSummary } from "./Analytics.api";

export const analyticsKeys = createQueryKeys("analytics");

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: analyticsKeys.detail("summary"),
    queryFn: fetchAnalyticsSummary,
  });
}
```

## Step 2 — `Analytics.tsx` (compose + handle every state)

```tsx
"use client";

import { Grid, Stack, Skeleton, Alert } from "@peppermint/ui";
import { ModalPaper } from "@peppermint/ui";
import { ModuleErrorBoundary } from "@peppermint/admin";
import { useAnalyticsSummary } from "./Analytics.hooks";
import { KpiCard } from "./components/KpiCard";
import { RevenueChartCard } from "./components/RevenueChartCard";

function AnalyticsBody() {
  const { data, isPending, isError, refetch } = useAnalyticsSummary();

  if (isPending) {
    return (
      <Stack gap="md" p="md">
        <Skeleton height={96} radius="md" />
        <Skeleton height={280} radius="md" />
      </Stack>
    );
  }

  if (isError) {
    return (
      <Alert color="red" title="Couldn't load analytics" m="md">
        <button onClick={() => refetch()}>Retry</button>
      </Alert>
    );
  }

  // empty state — no data collected yet
  if (data.kpis.length === 0) {
    return (
      <Stack align="center" p="xl">
        {/* honest empty state, not a spinner */}
        No analytics yet — data appears once activity is recorded.
      </Stack>
    );
  }

  return (
    <Stack gap="lg" p="md">
      <Grid>
        {data.kpis.map((kpi) => (
          <Grid.Col key={kpi.id} span={{ base: 12, sm: 6, lg: 3 }}>
            <KpiCard kpi={kpi} />
          </Grid.Col>
        ))}
      </Grid>
      <RevenueChartCard series={data.revenue} />
    </Stack>
  );
}

export function Analytics() {
  return (
    <ModalPaper withBorder>
      <ModuleErrorBoundary resetKeys={[]}>
        <AnalyticsBody />
      </ModuleErrorBoundary>
    </ModalPaper>
  );
}
```

## Step 3 — chart card (subpath import)

```tsx
"use client";

import { Card, Text } from "@peppermint/ui";
import { LineChart } from "@peppermint/ui/charts"; // subpath — never the main barrel
import type { RevenuePoint } from "../../Analytics.types";

export function RevenueChartCard({ series }: { series: RevenuePoint[] }) {
  return (
    <Card withBorder radius="md" p="md">
      <Text fw={600} mb="sm">
        Revenue
      </Text>
      <LineChart
        h={280}
        data={series}
        dataKey="month"
        series={[{ name: "revenue", color: "teal.6" }]}
      />
    </Card>
  );
}
```

Info-card overview pages are the same shape without charts: a `Grid` of `Card`s, each
fed by its own `useQuery` (or one query feeding all), every card handling loading/empty.

## Step 4 — `index.ts`

```ts
export { Analytics as ModuleAnalytics } from "./Analytics";
```

## Step 5 — `app/admin/analytics/page.tsx`

(Orchestrator-owned under parallel dispatch — report the re-export line instead.)

```tsx
import { ModuleAnalytics } from "@/modules/admin/analytics";
export default ModuleAnalytics;
```

## Step 6 — `docs/AI.md`

Mandatory. State `Module type: ContainedModule (Not-Contained — reporting)`, the route,
entry files, common edit targets, state ownership (React Query for server data, `useState`
for view toggles), and a "Do not do" block (no `useEffect` fetching, no `@mantine/*`, no
admin shell for a non-CRUD page). After creating, run `/update-ai-map`.

## Common Mistakes — Do Not Make These (Not-Contained)

- **Reaching for a shell** — if the page has no create/edit/delete, do not mount
  `DataTableShell` "just for the table." A read-only table is a `Table` from
  `@peppermint/ui` fed by `useQuery`.
- **Charts from the main barrel** — `import { LineChart } from "@peppermint/ui"` fails;
  it is a subpath export (`@peppermint/ui/charts`).
- **Skeleton-only loading, no empty state** — an empty dataset must render an honest
  "nothing yet" message, not an infinite skeleton.
- **`useEffect` fetching because "there's no shell to do it for me"** — the shell was
  never what enforced React Query; the stack rule stands regardless.
