# Testing Strategies

**Purpose:** Learn how to test executors and workflows  
**Audience:** QA engineers, developers  
**Reading time:** 10 minutes

---

## Testing Layers

```
┌─────────────────────────────────────┐
│ E2E: Full workflow via API          │
├─────────────────────────────────────┤
│ Integration: Executor + mocked deps │
├─────────────────────────────────────┤
│ Unit: Executor function isolated    │
└─────────────────────────────────────┘
```

---

## Unit Testing (Recommended)

### Setup: Mock ExecutorContext

```typescript
import { nodeCustom } from "./index";
import { createMockExecutorContext } from "@/shared/executor-context";

describe("nodeCustom", () => {
  let mockCtx: ExecutorContext;

  beforeEach(() => {
    mockCtx = createMockExecutorContext({
      sessionId: "test-session",
      logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      },
      memory: {
        getSessionMessages: jest.fn().mockResolvedValue([]),
        addSessionMessage: jest.fn(),
        getSessionSummary: jest.fn().mockResolvedValue(null),
        updateSessionSummary: jest.fn(),
      },
    });
  });

  // ... tests here
});
```

### Test: Happy Path

```typescript
it("should process valid input", async () => {
  const input = {
    sessionId: "test-session",
    message: "Hello",
  };

  const result = await nodeCustom(input, mockCtx);

  expect(result.isOk()).toBe(true);

  if (result.isOk()) {
    expect(result.value.reply).toBeDefined();
    expect(result.value.summary).toBeDefined();
  }

  // Verify session was updated
  expect(mockCtx.memory.addSessionMessage).toHaveBeenCalledWith(
    "test-session",
    expect.objectContaining({ role: "user" }),
  );
});
```

### Test: Invalid Input

```typescript
it("should reject invalid input", async () => {
  const input = {
    sessionId: "test-session",
    message: "", // Empty message
  };

  const result = await nodeCustom(input, mockCtx);

  expect(result.isErr()).toBe(true);

  if (result.isErr()) {
    expect(result.error.code).toBe("INVALID_INPUT");
    expect(result.error.retryable).toBe(false);
  }

  // Verify no state was changed
  expect(mockCtx.memory.addSessionMessage).not.toHaveBeenCalled();
});
```

### Test: Dependency Error (Retryable)

```typescript
it("should handle Redis errors gracefully", async () => {
  mockCtx.memory.getSessionMessages = jest
    .fn()
    .mockRejectedValueOnce(new Error("Redis timeout"));

  const input = {
    sessionId: "test-session",
    message: "Hello",
  };

  const result = await nodeCustom(input, mockCtx);

  expect(result.isErr()).toBe(true);

  if (result.isErr()) {
    expect(result.error.code).toBe("DEPENDENCY_ERROR");
    expect(result.error.retryable).toBe(true); // Should be retried
  }
});
```

### Test: LLM Error (Retryable)

```typescript
it("should handle LLM errors with retry", async () => {
  mockCtx.models.invoke = jest
    .fn()
    .mockRejectedValueOnce(new Error("Rate limit exceeded"));

  const input = {
    sessionId: "test-session",
    message: "Hello",
  };

  const result = await nodeCustom(input, mockCtx);

  expect(result.isErr()).toBe(true);

  if (result.isErr()) {
    expect(result.error.code).toBe("LLM_ERROR");
    expect(result.error.retryable).toBe(true);
  }
});
```

### Test: Cancellation

```typescript
it("should respect cancellation", async () => {
  mockCtx.isCancelled = jest.fn().mockResolvedValueOnce(true);

  const input = {
    sessionId: "test-session",
    message: "Hello",
  };

  const result = await nodeCustom(input, mockCtx);

  expect(result.isErr()).toBe(true);

  if (result.isErr()) {
    expect(result.error.code).toBe("CANCELLED");
  }
});
```

---

## Integration Testing

### Test: With Real Redis

```typescript
import { createRedisConnection } from "@/shared/redis";

describe("nodeCustom integration", () => {
  let redis: Redis;
  let ctx: ExecutorContext;

  beforeAll(async () => {
    redis = createRedisConnection();
    await redis.ping();
  });

  beforeEach(async () => {
    ctx = createExecutorContext({
      redis,
      sessionId: "integration-test",
      memory: new RealSessionStore(redis),
    });

    // Clean test data
    await redis.del(`session:integration-test:messages`);
    await redis.del(`session:integration-test:summary`);
  });

  afterAll(async () => {
    await redis.quit();
  });

  it("should update session memory", async () => {
    const input = {
      sessionId: "integration-test",
      message: "Hello",
    };

    const result = await nodeCustom(input, ctx);

    expect(result.isOk()).toBe(true);

    // Verify data was persisted to Redis
    const messages = await redis.lrange(
      "session:integration-test:messages",
      0,
      -1,
    );
    expect(messages.length).toBeGreaterThan(0);
  });
});
```

---

## E2E Testing

### Test: Full Workflow via API

```typescript
describe("Sales bot workflow E2E", () => {
  const baseUrl = "http://localhost:3000";

  it("should execute complete workflow", async () => {
    // 1. Enqueue workflow
    const runRes = await fetch(`${baseUrl}/v1/runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflowId: "momo.salesbot",
        sessionId: "e2e-test",
        input: { message: "I want running shoes" },
      }),
    });

    expect(runRes.status).toBe(202);
    const { runId } = await runRes.json();
    expect(runId).toBeDefined();

    // 2. Stream events
    const eventRes = await fetch(`${baseUrl}/v1/runs/${runId}/stream`);

    const reader = eventRes.body.getReader();
    const events = [];

    // Read all events
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = new TextDecoder().decode(value);
      const lines = text.split("\n");

      for (const line of lines) {
        if (line.startsWith("event:")) {
          events.push(line);
        }
      }
    }

    // 3. Verify event flow
    expect(events).toContainEqual(expect.stringContaining("run.started"));
    expect(events).toContainEqual(expect.stringContaining("node.started"));
    expect(events).toContainEqual(expect.stringContaining("node.finished"));
    expect(events).toContainEqual(expect.stringContaining("run.finished"));

    // Should have processed through guard → reason
    const nodeEvents = events.filter((e) => e.includes("node."));
    expect(nodeEvents.length).toBeGreaterThanOrEqual(4);
  });

  it("should reject invalid input via guard", async () => {
    const tooLong = "a".repeat(6000); // > 5000 limit

    const runRes = await fetch(`${baseUrl}/v1/runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflowId: "momo.salesbot",
        sessionId: "e2e-test-2",
        input: { message: tooLong },
      }),
    });

    const { runId } = await runRes.json();

    // Guard should reject
    const events = await streamEventsUntilComplete(runId);
    const failed = events.find((e) => e.type === "run.failed");
    expect(failed).toBeDefined();
  });
});

async function streamEventsUntilComplete(runId: string): Promise<any[]> {
  const events = [];
  const response = await fetch(`http://localhost:3000/v1/runs/${runId}/stream`);
  const reader = response.body!.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = new TextDecoder().decode(value);
    const parsed = parseSSEEvents(text);

    events.push(...parsed);

    if (
      parsed.some((e) => e.type === "run.finished" || e.type === "run.failed")
    ) {
      break;
    }
  }

  return events;
}
```

---

## Test Coverage

### Target Coverage

| Layer       | Coverage | Critical |
| ----------- | -------- | -------- |
| Executors   | 80%+     | Yes      |
| Workflows   | 60%+     | No       |
| Utilities   | 90%+     | Yes      |
| **Overall** | **70%+** | -        |

### Critical Paths to Test

- ✅ Happy path (valid input)
- ✅ Invalid input (guard validation)
- ✅ Transient errors (retryable)
- ✅ Permanent errors (non-retryable)
- ✅ Cancellation
- ✅ Timeout handling
- ✅ Tool-calling loop
- ✅ Memory update

---

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test

```bash
npm test -- nodeCustom.test.ts
```

### Watch Mode

```bash
npm test -- --watch
```

### Coverage Report

```bash
npm test -- --coverage
```

---

## Test Fixtures

### Create Fixture: Test Session

```typescript
export async function createTestSession(redis: Redis, sessionId: string) {
  const messages = [
    { role: "user", content: "Hello" },
    { role: "assistant", content: "Hi there!" },
  ];

  for (const msg of messages) {
    await redis.lpush(`session:${sessionId}:messages`, JSON.stringify(msg));
  }

  await redis.set(
    `session:${sessionId}:summary`,
    JSON.stringify({ phase: "greeting" }),
  );
}
```

### Create Fixture: Test Workflow

```typescript
export const testWorkflow: Workflow = {
  id: "test.simple",
  nodes: [
    {
      id: "guard",
      kind: "system.guardPolicy",
      config: { maxLength: 100 },
    },
  ],
  edges: [],
};
```

---

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ✓ Good – test what it does
expect(result.value.reply).toBeDefined();

// ✗ Bad – test how it does it
expect(mockCtx.memory.addSessionMessage).toHaveBeenCalledWith(...);
```

### 2. Mock External Dependencies

```typescript
// ✓ Mock Redis, LLM, HTTP
mockCtx.redis = { get: jest.fn(), set: jest.fn() };
mockCtx.models.invoke = jest.fn();

// ✗ Don't use real services in unit tests
```

### 3. Test Error Cases

```typescript
// ✓ Test all error paths
it("handles invalid input", ...);
it("handles LLM errors", ...);
it("handles Redis errors", ...);

// ✗ Only test happy path
```

### 4. Use Descriptive Names

```typescript
// ✓ Clear
it("should reject input longer than max length", ...);

// ✗ Vague
it("tests validation", ...);
```

### 5. Isolate Tests

```typescript
// ✓ Each test independent
beforeEach(() => {
  mockCtx = createMockExecutorContext();
});

// ✗ Tests dependent on each other
```

---

## Common Issues

### Issue: Test Timeout

**Cause:** Mock not set up, async operation hangs

**Fix:**

```typescript
jest.useFakeTimers();
// Run test
jest.runAllTimers();
jest.useRealTimers();
```

### Issue: Mock Not Called

**Cause:** Wrong mock setup or test logic wrong

**Fix:**

```typescript
expect(mockCtx.memory.addSessionMessage).toHaveBeenCalled();
// If fails, check:
// 1. Mock was registered correctly
// 2. Executor code path calls it
// 3. No early return before call
```

---

## Next Steps

1. **Debug in development** → [08-OBSERVABILITY.md](./08-OBSERVABILITY.md)
2. **Deploy with confidence** → [09-DEPLOYMENT.md](./09-DEPLOYMENT.md)

---

**Document:** 07-TESTING.md  
**Updated:** 2026-06-04  
**Status:** Ready
