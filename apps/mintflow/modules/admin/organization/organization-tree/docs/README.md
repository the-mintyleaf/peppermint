# OrganizationTree — Module Documentation

An interactive canvas for building and exploring hierarchical government/organizational structures. Built on React Flow with a Zustand store, a pure-function utility layer, and four specialized node types.

---

## Table of Contents

1. [What It Does](#what-it-does)
2. [File Map](#file-map)
3. [Data Model](#data-model)
4. [Store](#store)
5. [Utility Layer](#utility-layer)
6. [Main Component](#main-component)
7. [Node Types](#node-types)
8. [Panel Components](#panel-components)
9. [Key Data Flows](#key-data-flows)
10. [Performance Architecture](#performance-architecture)
11. [Adding New Features](#adding-new-features)

---

## What It Does

The OrganizationTree module renders a drag-and-drop org chart with:

- **4 node types**: Organization (ministry/office), Department/Division, Person, and Group
- **Explorer mode**: hierarchical expand/collapse — roots are always visible, children appear only when their parent is expanded
- **Full-map mode**: every node visible at once
- **Focus mode**: double-click any node to zoom into just its branch; breadcrumb nav to walk back up
- **Filters**: 8 visibility filters (departments only, leadership only, health issues, etc.) with ancestor preservation so context is never lost
- **Smart search**: type to highlight and auto-expand to matching nodes
- **Analytics panel**: live counts of orgs, people, missing heads, empty depts
- **Inspector panel**: right-hand drawer with rich stats, charts, and actions for the selected node
- **Undo/redo**: 50-step history
- **Auto-layout**: subtree-width algorithm that scales gap spacing with sibling count
- **Health checks**: per-node structural issues (missing head, empty dept, too many reports, inactive head)

---

## File Map

```
organization-tree/
├── OrganizationTree.tsx          # Main component + ReactFlow wiring
├── OrganizationTree.store.ts     # Zustand store — all UI state
├── OrganizationTree.utils.ts     # Pure graph functions (no React)
├── OrganizationTree.types.ts     # All TypeScript types
├── OrganizationTree.module.css   # Node and canvas styles
├── OrganizationTree.demoData.ts  # Static seed data (replace with API)
├── index.ts                      # Barrel export
│
├── components/
│   ├── nodes/
│   │   ├── OrgNode/              # Organization/ministry card
│   │   ├── DepartmentNode/       # Department/division card
│   │   ├── PersonNode/           # Person card with avatar
│   │   └── GroupNode/            # Collapsed group of nodes
│   │
│   ├── InspectorPanel/           # Right-hand detail panel
│   │   ├── InspectorPanel.tsx    # Shell + header + routing to sub-drawers
│   │   ├── charts.tsx            # KPI charts used by all sub-drawers
│   │   └── InspectorPanel.types.ts
│   │
│   ├── OrgDrawer/                # Detail content for org nodes
│   ├── DepartmentDrawer/         # Detail content for department nodes
│   ├── PersonDrawer/             # Detail content for person nodes
│   ├── GroupListDrawer/          # Member list for group nodes
│   │
│   ├── NodeFormModal/            # Add / edit form for all node types
│   ├── ImpactPreviewModal/       # Delete confirmation with affected counts
│   ├── Toolbar/                  # Bottom toolbar (add, zoom, layout, undo)
│   ├── FiltersPanel/             # Filter + expand-strategy panel
│   ├── AnalyticsPanel/           # Live summary stats overlay
│   ├── BreadcrumbNav/            # Path trail shown in focus mode
│   └── EmptyState/               # Shown when canvas has no nodes
│
└── docs/
    └── README.md                 # This file
```

---

## Data Model

Defined in `OrganizationTree.types.ts`.

### Node Data Union

```ts
type OrgNodeData = OrgOfficeData | DepartmentData | PersonData | GroupData;
```

Every node data object has a discriminant `nodeType` field matching the React Flow node `type`.

| `nodeType`     | React Flow `type` | Key fields                                                                         |
| -------------- | ----------------- | ---------------------------------------------------------------------------------- |
| `"org"`        | `"org"`           | `name`, `orgType` (ministry/office/district…), `status`, `location`, `headCount`   |
| `"department"` | `"department"`    | `name`, `deptType` (department/division/section…), `status`, `head`, `peopleCount` |
| `"person"`     | `"person"`        | `fullName`, `designation`, `role`, `status`, `email`, `avatarUrl`                  |
| `"group"`      | `"group"`         | `name`, `groupCategory` (dept/person), `memberCount`, `memberIds[]`                |

### Runtime Enrichment Fields

The main component attaches computed fields to each node's data before passing to React Flow. These start with `_` and are never persisted:

| Field                | Type                         | Description                                        |
| -------------------- | ---------------------------- | -------------------------------------------------- |
| `_expanded`          | `boolean`                    | Whether this node's children are currently visible |
| `_pathHighlighted`   | `boolean`                    | On the path from root to selected node             |
| `_dimmed`            | `boolean`                    | Outside the focused branch                         |
| `_searchMatch`       | `boolean`                    | Matches the current search query                   |
| `_directChildCounts` | `{ deptCount, personCount }` | Immediate children counts                          |
| `_descendantStats`   | `DescendantStats`            | Total people/depts in entire subtree               |
| `_healthIssues`      | `NodeHealthIssue[]`          | Structural problems (empty, missing head, etc.)    |

### Edge Data

```ts
type OrgFlowEdge = Edge & { data?: { relationshipType?: RelationshipType } };
```

`RelationshipType`: `contains` · `reports_to` · `heads` · `supervises` · `member_of` · `assigned_to`

Edge styles are computed live in `getEdgeStyleForRelationship` based on the relationship type, whether the edge is on the selection path, and whether it is dimmed.

### Health Issues

```ts
type NodeHealthIssue =
  | "missing_head" // dept/org has no person child with a head/manager/minister/secretary role
  | "empty_dept" // dept/org has zero person descendants
  | "no_parent" // department with no incoming edge (orphan)
  | "too_many_reports" // person has > 10 direct person reports
  | "inactive_head"; // the connected head person has status "inactive"
```

---

## Store

`OrganizationTree.store.ts` — a single Zustand store that owns all UI state. Components read from it and dispatch actions; they never mutate state directly.

### State Shape

```ts
// Selection & drawers
selectedNodeId: string | null
drawerOpen: boolean
activeDepartmentId: string | null   // dept context for "add person" mode

// Search
searchQuery: string
searchMatchIds: string[]

// Node add/edit modal
nodeModal: NodeModalConfig          // open, mode, nodeType, editingNodeId, pendingParentId

// History (undo/redo)
history: Array<{ nodes, edges }>
historyIndex: number
saved: boolean

// Context menu
contextMenu: { x, y, nodeId } | null

// Tree expansion
expandedNodeIds: string[]           // nodes whose children are visible
expandedGroupIds: string[]          // group nodes with members shown
focusedBranchId: string | null      // double-click focus mode
viewMode: "explorer" | "fullmap"
edgeCache: OrgFlowEdge[]           // mirror of React Flow edges for store-side graph ops

// Filters
activeFilters: FilterKey[]
expandStrategy: ExpandStrategy
```

### Key Actions

| Action                      | What it does                                                                                                                             |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `selectNode(id)`            | Sets `selectedNodeId`, opens the inspector                                                                                               |
| `closeDrawer()`             | Clears selection and closes inspector                                                                                                    |
| `expandNode(id)`            | Adds id to `expandedNodeIds`. If `expandStrategy === "full_branch"`, expands entire subtree                                              |
| `collapseNode(id)`          | Removes id and all descendants from `expandedNodeIds`. If the selected node is inside the collapsing subtree, moves selection up to `id` |
| `collapseAll()`             | Clears `expandedNodeIds`, `expandedGroupIds`, `focusedBranchId`                                                                          |
| `setFocusedBranch(id)`      | Enters focus mode on a branch                                                                                                            |
| `pushHistory(nodes, edges)` | Saves a snapshot for undo; capped at 50 entries                                                                                          |
| `undo(setNodes, setEdges)`  | Restores previous snapshot                                                                                                               |
| `redo(setNodes, setEdges)`  | Restores next snapshot                                                                                                                   |
| `setFilter(key, on)`        | Toggles a visibility filter                                                                                                              |
| `reapplyExpandStrategy()`   | Re-runs expansion from current `expandedNodeIds` using the active strategy                                                               |
| `syncEdgeCache(edges)`      | Keeps `edgeCache` in sync so store-side graph operations (subtree BFS) have the latest topology                                          |

### Expand Strategy

Controls what happens when `expandNode` is called with `expandStrategy === "full_branch"`:

| Strategy                                          | Effect on expand click                                                                                                |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `"direct"`                                        | Shows only immediate children (default)                                                                               |
| `"full_branch"`                                   | Recursively expands all descendants                                                                                   |
| `"depts_only"` / `"people_only"` / `"leadership"` | Currently behave like `"direct"` (expansion is per-click); the **Filters panel** handles visibility scoping for these |

> The filter-based strategies work at the _visibility_ layer, not the expansion layer. Set `expandStrategy: "direct"` and `activeFilters: ["depts_only"]` together to expand freely but only show department nodes.

---

## Utility Layer

`OrganizationTree.utils.ts` — pure functions with no React dependencies. All accept `MinNode[]` and `MinEdge[]` so they work with any graph-like data, not just `OrgFlowNode`.

### Shared Constants

```ts
STATUS_COLORS; // { active: "teal", inactive: "gray", archived: "red" }
getInitials(name); // "John Doe" → "JD"
```

### Graph Builders

```ts
computeChildrenMap(edges); // → Record<id, id[]>   — source → children
computeParentMap(edges); // → Record<id, id>     — target → parent
```

Both are used to build the `graphMaps` object once per render. Never call these inside loops.

### Traversal Functions

All accept optional pre-built maps to skip redundant construction when called in a hot path:

```ts
computeSubtreeIds(nodeId, edges, childrenOf?)
// BFS from nodeId downward. Returns all descendant ids including nodeId itself.

computePathFromRoot(nodeId, edges, parentMap?)
// Walks parent pointers from nodeId up to the root. Returns [root, ..., nodeId].

computeDimmedNodeIds(focusedBranchId, visibleNodeIds, edges, childrenOf?, parentMap?)
// Returns all visible node ids that are NOT on the path to or inside the focused branch.
```

### Aggregate Functions

```ts
computeVisibleNodeIds(nodes, edges, expandedIds, viewMode)
// Returns the ids that should appear on canvas in explorer mode.
// Roots (no parent edge, non-person) are always visible.
// Children appear only when their parent is in expandedIds.

computeDirectChildCounts(nodeId, nodes, edges, childrenOf?, nodeTypeMap?)
// → { deptCount, personCount } — immediate children only

computeDescendantStats(nodeId, nodes, edges, childrenOf?, nodeTypeMap?)
// → { totalPeople, totalDepts, hiddenLevels }
// BFS across the entire subtree.

computeNodeHealth(nodeId, nodes, edges, childrenOf?, nodeTypeMap?, nodeDataMap?, descendantStats?)
// → NodeHealthIssue[]
// Checks structural issues for dept/org/person nodes.
// Pass pre-computed descendantStats to avoid a duplicate BFS.
```

### Helper Functions

```ts
expandAncestors(nodeId, edges, currentExpandedIds);
// Returns a new expanded id array that includes all ancestors of nodeId.
// Used by smart search to auto-open the tree to matching nodes.

collectAncestors(matchedIds, parentMap);
// → Set<string> of all ancestors across a set of matched ids.
// Used by filter ancestor-preservation (O(ancestors) total, not O(matches × depth)).
```

---

## Main Component

`OrganizationTree.tsx` exports two components:

```tsx
export function OrganizationTree(); // outer — wraps ReactFlowProvider
function OrganizationTreeInner(); // inner — all logic lives here
```

The split is required because React Flow hooks (`useReactFlow`, `useNodesState`, `useEdgesState`) can only be called inside a `ReactFlowProvider`.

### Memo Pipeline

The component has a layered derivation chain. Each memo depends only on what actually changed:

```
nodes + edges
    ↓
graphMaps          (childrenOf, parentMap, nodeTypeMap, nodeDataMap, nodesMap)
    ↓
visibleIds         (BFS from roots respecting expandedNodeIds)
    ↓
visibleIdsWithGroups  (+ group member ids for expanded groups)
    ↓
pathNodeIds        (root → selectedNodeId path)
dimmedNodeIds      (everything outside focused branch)
descendantStatsMap (per-node subtree stats, uses graphMaps)
healthIssuesMap    (per-node health check, uses graphMaps + descendantStatsMap)
    ↓
filteredVisibleIds (apply activeFilters + preserve ancestors)
    ↓
enrichedVisibleNodes  (ReactFlow node array with all _fields attached)
enrichedVisibleEdges  (styled edge array)
```

Each layer only recomputes when its direct inputs change. A search query change does not retrigger graph traversals; an edge addition does not retrigger the filter logic if the visible set didn't change.

### `graphMaps` — The Key Optimization

```tsx
const graphMaps = useMemo(
  () => ({
    childrenOf: computeChildrenMap(edges),
    parentMap: computeParentMap(edges),
    nodeTypeMap: new Map(nodes.map((n) => [n.id, n.type])),
    nodeDataMap: new Map(nodes.map((n) => [n.id, n.data])),
    nodesMap: new Map(nodes.map((n) => [n.id, n])),
  }),
  [nodes, edges],
);
```

All five maps are built **once** per `nodes`/`edges` change and passed into every dependent memo and callback. Without this, each utility call in a loop would rebuild O(n) + O(e) maps independently — for 200 nodes, that was ~400+ redundant map constructions per render.

### Auto-Layout

`autoArrangeNodes(nodes, edges, layoutMode)` is a pure recursive subtree-width algorithm:

1. Compute `subtreeWidth(id)` bottom-up: a leaf has width `NODE_W`; a parent is the sum of its children's widths plus dynamic gaps.
2. Gap size scales with sibling count: `<= 2` → base gap, `<= 4` → 1.25×, `<= 8` → 1.6×, `> 8` → 2×.
3. Lay out each root at `x = rootX + subtreeWidth / 2`, then recursively center children.

The layout runs automatically when `visibleLayoutKey` changes (the sorted join of visible node ids), and can be manually triggered via the Toolbar's layout menu.

### Search

1. User types → debounced 150ms → `setSearchQuery`
2. `useEffect` on `searchQuery` → finds `matchedIds` via `nodeMatchesSearch` → `setSearchMatchIds` → auto-expands ancestors via `expandAncestors`
3. `enrichedVisibleNodes` reads `activeSearchMatchIds` → sets `_searchMatch: true` on matching nodes
4. Node cards read `_searchMatch` and apply a highlight CSS class

`nodeMatchesSearch` (local function in main component):

- `person` → matches `fullName` or `designation`
- `department` / `org` → matches `name`
- `group` → always passes (groups aren't text-searchable but shouldn't be hidden)

---

## Node Types

All four node components follow the same pattern:

1. Read enrichment fields from `data` (the `_*` fields attached by the main component)
2. Read actions from `useOrgTreeStore()` directly — no prop-drilling for actions
3. Hover state drives the action button strip (`nodeActions`)
4. Expand/collapse buttons call `expandNode` / `collapseNode` from the store

### OrgNode

Color-coded by `orgType`. Shows location, total people count, expand strip with unit/staff counts. Hover actions: focus, add department, edit, delete.

### DepartmentNode

Color-coded by `data.color` (custom) or `deptType` fallback. Shows head name, parent name, task counts. Expand strip shows sub-units and staff count with hidden level depth. Hover actions: focus, details, add child, add person, edit, delete.

### PersonNode

Shows avatar with initials fallback, role badge, designation, department, direct reports count. Expand strip for person chains (a person can report to another person, e.g., Secretary → Joint Secretary). Hover actions: view profile, edit, remove.

> **Delete on node cards is a no-op button** — the real delete flows through `handleRequestDelete` in the main component (via context menu or inspector panel) so the impact preview modal fires.

### GroupNode

Represents a collapsed set of nodes (people or offices). Shows member count. Two buttons: list view (opens inspector) and expand on canvas (calls `expandGroup` + `expandNode`).

---

## Panel Components

### InspectorPanel

A fixed-width (480px) panel that slides in on the right side of the canvas when a node is selected. It does not use a Drawer — it sits in the flex row alongside the canvas for better spatial continuity.

Routes to sub-content based on `selectedNode.type`:

- `"org"` → `OrgDrawerContent`
- `"department"` → `DepartmentDrawerContent`
- `"person"` → `PersonDrawerContent`
- `"group"` → `GroupListContent`

The header 3-dot menu provides type-appropriate actions (Edit, Add Division, Add Person, Delete).

### Drawer Sub-Contents

Each drawer content component (`OrgDrawerContent`, `DepartmentDrawerContent`, `PersonDrawerContent`) renders a stack of KPI cards using the shared `charts.tsx` primitives:

| Primitive         | Description                                                                  |
| ----------------- | ---------------------------------------------------------------------------- |
| `KpiCard`         | Titled card wrapper                                                          |
| `StatRow`         | Metric with value, delta badge, sparkline                                    |
| `MiniBarChart`    | Small bar chart (6 months)                                                   |
| `RingChart`       | Donut ring with center label                                                 |
| `ProgressBar`     | Labeled progress bar                                                         |
| `ActivityHeatmap` | GitHub-style contribution grid                                               |
| `StackedBar`      | Horizontal proportional bar                                                  |
| `makeSeededRng`   | Deterministic RNG seeded by node id — produces consistent demo data per node |

### FiltersPanel

Floating panel (top-right of canvas). Two sections:

1. **Filters** — chip toggles mapped to `FilterKey`. Multiple filters are ANDed together. Active filters use ancestor-preservation: a node that doesn't match is still shown if a descendant matches.

2. **Expand Strategy** — controls what happens when you click expand on a node card. `"direct"` shows one level; `"full_branch"` expands the entire subtree recursively. The "Re-apply" button runs `reapplyExpandStrategy()` to rebuild expansion from the current set of expanded roots.

### AnalyticsPanel

Floating panel (bottom-left of canvas). Always-visible summary:

```
Orgs | Depts | People | Missing Heads | Empty Depts | Inactive
```

All counts are derived live from the `nodes` array and `healthIssuesMap`.

### Toolbar

Floating bar (bottom-center of canvas). Groups:

- **Add** — opens `NodeFormModal` for org/department/person
- **Active department badge** — shown when "add person" mode is active for a specific department
- **Focus mode badge** — back-to-parent and clear-focus when in focus mode
- **Undo / Redo / Collapse all**
- **View mode toggle** (explorer ↔ full map)
- **Layout menu** (compact / expanded auto-arrange)
- **Zoom in / Zoom out / Fit visible / Fit all**

### BreadcrumbNav

Shown only in focus mode (when `focusedBranchId` is set). Displays the path from root to the focused node. Clicking any segment calls `setFocusedBranch(id)` to re-focus at that level.

### NodeFormModal

Shared add/edit form for all node types. The displayed fields change based on `nodeType`:

- `"org"` → name, orgType, description, location, status
- `"department"` → name, deptType, head, parent, status
- `"person"` → fullName, designation, role, email, phone, status
- `"group"` → name, groupCategory, memberIds

### ImpactPreviewModal

Shown before any delete. Displays `affectedPeople` and `affectedDepts` (computed via `computeDescendantStats` at the moment of delete request). Requires explicit confirmation before `handleConfirmDelete` fires.

---

## Key Data Flows

### Adding a Node

```
Toolbar "Add" / node hover "+" button
    → openAddModal(type, parentId?, parentName?)
    → NodeFormModal opens
    → user submits
    → handleAddNode(data)
        → creates OrgFlowNode with random position
        → setNodes([...ns, newNode])
        → if parentId: creates edge + storeExpandNode(parentId)
        → pushHistory(updated, edges)
        → markDirty()
    → NodeFormModal closes
    → graphMaps recomputes → visibility chain recomputes → layout re-runs
```

### Deleting a Node

```
Context menu "Delete" / Inspector panel "Delete"
    → handleRequestDelete(nodeId)
        → computeDescendantStats to get impact counts
        → setImpactPreview({ nodeId, nodeName, affectedPeople, affectedDepts })
    → ImpactPreviewModal opens
    → user confirms
    → handleConfirmDelete()
        → setNodes(ns.filter(n => n.id !== nodeId))
        → setEdges(es.filter(e => e.source !== nodeId && e.target !== nodeId))
        → pushHistory + markDirty
```

### Expanding a Node

```
Node card expand button → store.expandNode(id)
    → if full_branch: computeSubtreeIds → add all to expandedNodeIds
    → else: append id to expandedNodeIds
    → visibleIds recomputes
    → graphMaps recomputes (edges unchanged, so only nodeTypeMap may change)
    → enrichedVisibleNodes recomputes
    → visibleLayoutKey changes → layout effect fires → autoArrangeNodes
```

### Collapsing a Node

```
Node card collapse button → store.collapseNode(id)
    → computeSubtreeIds(id, edgeCache) → descendants set
    → if selectedNodeId is in descendants: move selection to id
    → filter expandedNodeIds removing all descendants
    → same recompute cascade as expand
```

### Applying a Filter

```
FiltersPanel chip toggle → store.setFilter(key, on)
    → activeFilters array updates
    → filteredVisibleIds recomputes:
        for each visible node:
            apply all active filters (AND logic)
            if passes: add to result + push to matchedIds
        collectAncestors(matchedIds, parentMap) → add to result
    → enrichedVisibleNodes filters down to filteredVisibleIds
    → visibleLayoutKey changes → layout re-runs
```

### Focus Mode

```
Node double-click → store.setFocusedBranch(nodeId)
    → focusedBranchId = nodeId
    → dimmedNodeIds recomputes:
        path = computePathFromRoot(focusedBranchId, edges, parentMap)
        subtree = computeSubtreeIds(focusedBranchId, edges, childrenOf)
        dimmed = all visible nodes NOT in path ∪ subtree
    → enrichedVisibleNodes gets _dimmed: true for out-of-focus nodes
    → BreadcrumbNav appears showing path[root → focusedBranchId]
    → Toolbar shows "focused branch" badge with parent/clear controls
```

---

## Performance Architecture

### The `graphMaps` Pattern

The root of all graph operations is a single `useMemo` that runs once per `nodes`/`edges` change:

```
graphMaps = {
  childrenOf,   // parent → children[]  — for BFS downward
  parentMap,    // child → parent        — for walking up
  nodeTypeMap,  // id → type             — for type checks without array scans
  nodeDataMap,  // id → data             — for data access without find()
  nodesMap,     // id → OrgFlowNode      — replaces nodes.find() everywhere
}
```

Every downstream memo and callback receives maps from here instead of rebuilding them. The performance impact scales with tree size:

| Approach                                | Operations per render (200 nodes, 200 edges) |
| --------------------------------------- | -------------------------------------------- |
| Old: rebuild maps inside each util call | ~1,200 map builds per render cycle           |
| New: graphMaps built once, shared       | 5 map builds per render cycle                |

### Util Function Signatures

All utility functions that need a children map, parent map, or node type map accept them as **optional** last parameters:

```ts
computeDescendantStats(nodeId, nodes, edges, childrenOf?, nodeTypeMap?)
computeNodeHealth(nodeId, nodes, edges, childrenOf?, nodeTypeMap?, nodeDataMap?, descendantStats?)
computePathFromRoot(nodeId, edges, parentMap?)
computeSubtreeIds(nodeId, edges, childrenOf?)
computeDirectChildCounts(nodeId, nodes, edges, childrenOf?, nodeTypeMap?)
computeDimmedNodeIds(focusedBranchId, visibleIds, edges, childrenOf?, parentMap?)
```

If called without the optional params (e.g., from the store), they build maps internally. If called from the main component's memos, they receive pre-built maps from `graphMaps`.

### `healthIssuesMap` Reuses `descendantStatsMap`

`computeNodeHealth` needs `totalPeople` to detect empty departments. Rather than re-running the BFS inside `computeNodeHealth`, the main component passes the already-computed entry from `descendantStatsMap`:

```tsx
computeNodeHealth(
  id,
  nodes,
  edges,
  childrenOf,
  nodeTypeMap,
  nodeDataMap,
  descendantStatsMap.get(id),
);
```

This eliminates N redundant BFS traversals per render when health issues are shown.

### Layout Effect Isolation

The auto-layout effect intentionally depends only on `visibleLayoutKey` (a sorted join of visible node ids), not on `edges` directly. This is why `edgesRef` exists: the effect captures the latest edge state without making edges a reactive dependency. Without this, any edge style change (e.g., hover highlight) would re-trigger a full layout pass.

---

## Adding New Features

### New Node Type

1. Add `"mytype"` to `OrgNodeType` in `OrganizationTree.types.ts`
2. Create `MyTypeData` interface extending `Record<string, unknown>` with `nodeType: "mytype"`
3. Add to the `OrgNodeData` union
4. Create `components/nodes/MyTypeNode/` following the component structure
5. Add to `nodeTypes` map in `OrganizationTree.tsx`
6. Handle in `computeDescendantStats` (count as person or dept)
7. Handle in `computeNodeHealth` if structural checks apply
8. Handle in `nodeMatchesSearch` if text-searchable
9. Add icon color to `MiniMap`'s `nodeColor` callback

### New Filter

1. Add the key to `FilterKey` in `OrganizationTree.types.ts`
2. Add a `case` block in `filteredVisibleIds` useMemo in `OrganizationTree.tsx`
3. Add `{ key, label }` to `FILTER_OPTIONS` in `FiltersPanel.tsx`

### New Health Check

1. Add the issue type to `NodeHealthIssue` in `OrganizationTree.types.ts`
2. Add detection logic in `computeNodeHealth` in `OrganizationTree.utils.ts`
3. Add a display label in `DepartmentDrawer` or `PersonDrawer` `HEALTH_LABELS` map

### Connecting to a Real API

Replace `DUMMY_NODES` / `DUMMY_EDGES` in the `useEffect` initialization block in `OrganizationTree.tsx`. The expected shapes are `OrgFlowNode[]` and `OrgFlowEdge[]`. A React Query `useQuery` call fits naturally here — call `setNodes`, `setEdges`, `syncEdgeCache`, and `pushHistory` in the `onSuccess` callback.
