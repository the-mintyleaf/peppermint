# Fix: `input?: any` in AdvanceInput

**File:** `src/orchestrator/runner/index.ts`

**Problem:** `AdvanceInput.input` is typed as `any`, which flows as `prevOutput` into every successor node untyped.

**Fix:** Change to `Record<string, unknown>` so the type contract is explicit.

- [ ] Replace `input?: any` with `input?: Record<string, unknown>`
