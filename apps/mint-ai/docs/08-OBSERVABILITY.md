# Observability: Logging, Metrics, Debugging

**Purpose:** Monitor and debug mint-ai in development and production  
**Audience:** Developers, DevOps  
**Reading time:** 10 minutes

---

## Logging

### Structured Logging with Pino

All logs are **structured JSON** for easy parsing.

```typescript
ctx.logger.info({ sessionId, count: 5 }, "Processing started");
// Output:
// {"level":"info","sessionId":"...","count":5,"message":"Processing started","timestamp":"..."}
```

### Log Levels

```typescript
ctx.logger.debug({ key: "value" }, "Detailed debug info");
ctx.logger.info({ key: "value" }, "Important info");
ctx.logger.warn({ key: "value" }, "Warning");
ctx.logger.error({ error }, "Error occurred");
```

### Setting Log Level

```bash
# Development
LOG_LEVEL=debug npm run dev

# Production
LOG_LEVEL=info npm run dev

# Only warnings and errors
LOG_LEVEL=warn npm run dev
```

### Key Fields Automatically Included

Every log includes:
- `runId` – Workflow run ID
- `nodeId` – Node being executed
- `sessionId` – Session ID
- `requestId` – Request trace ID
- `timestamp` – When the log occurred

### Example: Trace a Request

```bash
# Find all logs for a specific run
npm run dev | grep run-abc-123

# Output:
# {"level":"info","runId":"run-abc-123","nodeId":"guard",...} run.started
# {"level":"info","runId":"run-abc-123","nodeId":"guard",...} node.started
# {"level":"info","runId":"run-abc-123","nodeId":"guard",...} node.finished
# {"level":"info","runId":"run-abc-123","nodeId":"reason",...} node.started
```

---

## Metrics

### Record Metrics in Executors

```typescript
// Record success
ctx.metrics.recordExecutorSuccess("agents.reasoning", 1234);  // duration in ms

// Record error
ctx.metrics.recordExecutorError("agents.reasoning", "LLM_ERROR", 1234);

// Record tokens
ctx.metrics.recordTokens(ctx.runId, {
  input: 100,
  output: 50,
  total: 150
});

// Record custom metric
ctx.metrics.recordCustom("tool_calls", 3);
```

### View Metrics

```bash
# Get current metrics
curl http://localhost:3000/metrics

# Output:
# system.guardPolicy.success.count: 42
# system.guardPolicy.success.avg_duration_ms: 45
# agents.reasoning.error.count: 3
# agents.reasoning.error.LLM_ERROR.count: 2
# agents.reasoning.tokens.total: 50000
# ...
```

---

## Debugging

### Check Redis Data

```bash
redis-cli

# List all keys
> KEYS *

# Check session messages
> LRANGE session:user-123:messages 0 -1
> JSON.GET session:user-123:summary

# Check queue jobs
> LLEN bull:runs:waiting
> LLEN bull:runs:active
> LLEN bull:nodes:waiting

# Check specific job
> HGETALL bull:runs:1
```

### Monitor Queue in Real-Time

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Watch Redis keys
redis-cli --stat 1  # Update every 1 second
```

### Simulate a Workflow

```bash
# Enqueue
curl -X POST http://localhost:3000/v1/runs \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "momo.salesbot",
    "sessionId": "debug-user",
    "input": { "message": "Hello" }
  }'
# Output: {"runId":"run-abc-123"}

# Stream events
curl -N http://localhost:3000/v1/runs/run-abc-123/stream

# Check Redis
redis-cli
> LRANGE session:debug-user:messages 0 -1
> GET session:debug-user:summary
```

---

## Event Tracing

### Understand Event Flow

Events emitted during execution:

```
run.started
├─ nodeId (not set)
├─ timestamp
└─ runId

node.started
├─ nodeId: "guard.policy"
├─ timestamp
└─ runId

node.finished
├─ nodeId: "guard.policy"
├─ result: {...}
├─ timestamp
└─ runId

token (streaming)
├─ partial: "Hello"
├─ timestamp
└─ runId

node.started
├─ nodeId: "agents.reasoning"
├─ timestamp
└─ runId

node.finished
├─ nodeId: "agents.reasoning"
├─ result: {...}
├─ timestamp
└─ runId

run.finished
├─ finalResult: {...}
├─ timestamp
└─ runId
```

### Parse Events Manually

```bash
# Stream and format
curl -N http://localhost:3000/v1/runs/run-abc-123/stream | \
  jq -R 'split("\n") | .[] | select(. | startswith("data:")) | .[6:] | fromjson'
```

---

## Common Issues & Solutions

### Issue: Workflow Hangs (Never Completes)

**Symptoms:** Worker seems stuck, no new logs

**Debugging:**
```bash
# 1. Check active jobs
redis-cli LLEN bull:nodes:active

# 2. View active job details
redis-cli HGETALL bull:nodes:2  # Replace 2 with ID

# 3. Check logs for errors
LOG_LEVEL=debug npm run dev

# 4. Restart workers
npm run dev
```

**Fixes:**
- Check for infinite loops in executor
- Ensure tool-calling loop has max iterations
- Verify no promise is never resolved

---

### Issue: Memory Grows Unbounded

**Symptoms:** Redis memory keeps increasing

**Debugging:**
```bash
redis-cli
> INFO memory
> KEYS "session:*"
> LLEN session:user-123:messages  # Check message count
```

**Fixes:**
- Reduce `memoryLimit` in executor config
- Reduce session TTL
- Ensure summaries are effective (not duplicate messages)

```typescript
// Set in workflow config
{
  id: "reason",
  kind: "agents.reasoning",
  config: {
    memoryLimit: 5,  // Keep only 5 messages
    sessionTTL: 3600  // 1 hour (was 24h)
  }
}
```

---

### Issue: Executor Errors Not Being Retried

**Symptoms:** Job fails once and stops

**Debugging:**
```typescript
// Check error type
if (result.isErr()) {
  console.log(result.error.retryable);  // Should be true for retryable
}
```

**Fix:**
```typescript
// Mark transient errors as retryable
return err({
  code: "LLM_ERROR",
  message: "Rate limit",
  retryable: true  // ✓ Will retry
});

// Mark permanent errors as non-retryable
return err({
  code: "INVALID_INPUT",
  message: "Message too long",
  retryable: false  // ✓ Won't retry
});
```

---

### Issue: LLM Calls Timing Out

**Symptoms:** Workflows slow or timing out

**Debugging:**
```bash
# Check LLM response times
LOG_LEVEL=debug npm run dev | grep "LLM call"

# Check config
curl http://localhost:3000/config
```

**Fixes:**
```typescript
// Increase timeout in executor config
{
  id: "reason",
  kind: "agents.reasoning",
  config: {
    timeout: 30000,  // 30 seconds (was 10s)
    maxTokens: 500   // Reduce to speed up
  }
}
```

---

### Issue: Redis Connection Lost

**Symptoms:** "ECONNREFUSED", "Connection timeout"

**Debugging:**
```bash
redis-cli ping

# If PONG, Redis is running
# If connection refused, start Redis
```

**Fix:**
```bash
# Check Redis is running
redis-cli ping  # Should return PONG

# Start Redis if needed
brew services start redis
# or
docker run -d -p 6379:6379 redis:7

# Verify connection
npm run dev
```

---

## Performance Profiling

### Measure Executor Duration

```typescript
// Built-in timing
ctx.metrics.recordExecutorSuccess("agents.reasoning", duration);

// Check results
curl http://localhost:3000/metrics | grep agents.reasoning
```

### Profile Hot Paths

```bash
# Start with profiling enabled
NODE_OPTIONS='--prof' npm run dev

# Generate profile
node --prof-process isolate-*.log > profile.txt

# Check slowest operations
cat profile.txt | grep "agents.reasoning"
```

---

## Alerts & Monitoring (Production)

### Key Metrics to Alert On

| Metric | Threshold | Action |
|--------|-----------|--------|
| Executor error rate | > 5% | Page on-call |
| Job queue depth | > 1000 | Scale workers |
| Redis memory | > 80% | Investigate leak |
| LLM latency | > 10s | Check provider |
| Failed jobs (permanent) | > 10/min | Investigate |

### Export Metrics

```typescript
// Prometheus format
GET /metrics/prometheus

# Returns:
# # HELP executor_success_count Total successful executions
# # TYPE executor_success_count counter
# executor_success_count{executor="agents.reasoning"} 42
# ...
```

---

## Next Steps

1. **Test your changes** → [07-TESTING.md](./07-TESTING.md)
2. **Deploy to production** → [09-DEPLOYMENT.md](./09-DEPLOYMENT.md)

---

**Document:** 08-OBSERVABILITY.md  
**Updated:** 2026-06-04  
**Status:** Ready
