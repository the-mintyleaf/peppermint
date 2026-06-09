# Router node executor

**Files:**
- `src/executors/nodes/system/nodeRouter/nodeRouter.type.ts`
- `src/executors/nodes/system/nodeRouter/index.ts`
- `src/executors/nodes/index.ts` — register
- `src/orchestrator/runner/index.ts` — honor `output.target`
- `src/types/contracts.ts` — add router schemas

**Purpose:** Evaluates the current session summary against a list of conditions and returns the target node to route to. Enables intent-driven branching without hardcoding edges.

**Condition format:**
```ts
{ when: { phase: "checkout" }, target: "agents.checkout" }
```

**Runner change:** If `output?.target` is set, `advanceWorkflow` only enqueues that specific successor (instead of all edges from the node).

**Steps:**
- [ ] Define `PropNodeRouterInput`, `PropNodeRouterOutput`, `RouterCondition` types
- [ ] Implement `nodeRouter` executor: load session summary, evaluate conditions in order, return first match
- [ ] Add fallback `target` for when no condition matches
- [ ] Register `system.router` in `src/executors/nodes/index.ts`
- [ ] Update `advanceWorkflow` to check `output?.target` and filter successors
