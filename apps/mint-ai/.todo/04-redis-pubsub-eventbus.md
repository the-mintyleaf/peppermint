# Redis Pub/Sub EventBus

**Files:**
- `src/shared/events/eventBus.ts` — rewrite
- `src/shared/redis/redis.ts` — add pub/sub client helper

**Problem:** In-memory EventBus breaks multi-worker deployments. A `run.finished` emitted on Worker B never reaches the SSE connection held by Worker A.

**Fix:** Replace in-process listeners with Redis pub/sub.
- One shared subscriber connection that demultiplexes by channel
- Publisher uses the existing Redis client
- Channel naming: `run:{runId}:events`
- Unsubscribe from Redis channel when last listener for a runId drops

**Steps:**
- [ ] Add `getRedisSubscriber()` function in `redis.ts` (separate connection, no `maxRetriesPerRequest: null`)
- [ ] Rewrite `EventBus` class to use `publisher.publish()` / `subscriber.subscribe()`
- [ ] Keep the same public API (`subscribe`, `emitEvent`) so no other files need to change
