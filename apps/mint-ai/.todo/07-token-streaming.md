# Token streaming in nodeAIReasoning

**File:** `src/executors/nodes/agents/reasoning/index.ts`

**Problem:** LLM responds in full before any event fires. The `token` event type already exists in `stream.type.ts` but is never emitted.

**Fix:** When no tools are configured, use `model.stream()` and emit `token` events via `ctx.emitEvent`. When tools ARE configured, keep `model.invoke()` (tool-calling loops don't compose cleanly with streaming).

**Steps:**
- [ ] Split step 8 into two branches: stream path (no tools) and invoke path (with tools)
- [ ] In stream path: iterate `model.stream()`, emit `ctx.emitEvent('token', { content: chunk })` per chunk
- [ ] Collect full content string from stream for downstream JSOC parsing
