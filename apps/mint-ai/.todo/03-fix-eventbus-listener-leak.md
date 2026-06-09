# Fix: EventBus listener array leak

**File:** `src/shared/events/eventBus.ts`

**Problem:** On unsubscribe, empty `listeners[runId]` arrays are left in memory indefinitely. A long-running process will accumulate empty arrays for every runId it has ever seen.

**Fix:** After filtering out the listener, delete the key if the array is empty.

- [ ] Add `if (!this.listeners[runId].length) delete this.listeners[runId]` in unsubscribe
