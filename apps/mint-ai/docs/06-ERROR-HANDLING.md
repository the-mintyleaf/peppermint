# Error Handling & Result Types

**Purpose:** Understand error handling patterns and Result types  
**Audience:** All engineers  
**Reading time:** 10 minutes

---

## The Problem with Exceptions

Traditional error handling (throw/catch) has issues:

```typescript
// ✗ Problem: Exception can be thrown anywhere, hard to track
async function process(input) {
  const data = await fetchData();  // Can throw
  const parsed = parseJson(data);  // Can throw
  await save(parsed);              // Can throw
  return parsed;
  // If any throw, caller must have try/catch
  // But maybe they forget!
}
```

**Solution:** Use **Result types** – errors are part of the type system.

---

## Result Types

```typescript
type Result<T, E> = Ok<T> | Err<E>;

interface Ok<T> {
  isOk(): true;
  isErr(): false;
  value: T;
}

interface Err<E> {
  isOk(): false;
  isErr(): true;
  error: E;
}
```

**Key insight:** Compiler forces error handling. You can't ignore errors.

---

## Creating Results

### Success Case

```typescript
import { ok } from "@/shared/result";

return ok({
  reply: "Hello!",
  summary: { phase: "greeting" }
});
```

### Error Case

```typescript
import { err } from "@/shared/result";

return err({
  code: "INVALID_INPUT",
  message: "Message too long",
  retryable: false
});
```

---

## Handling Results

### Pattern 1: If/Else

```typescript
const result = await executor(input, ctx);

if (result.isOk()) {
  // Success path
  const output = result.value;
  console.log(output.reply);
} else {
  // Error path
  const error = result.error;
  console.log(error.message);
}
```

### Pattern 2: Map/AndThen (Chaining)

```typescript
const result = ok(5)
  .map(n => n * 2)           // Ok(10)
  .andThen(n => ok(n + 3))   // Ok(13)
  .map(n => n.toString());   // Ok("13")

if (result.isOk()) {
  console.log(result.value);  // "13"
}
```

### Pattern 3: Unwrap

```typescript
// Get value or throw
const value = result.unwrap();

// Get value or use default
const value = result.unwrapOr(defaultValue);

// Transform error
const result2 = result.mapErr(e => ({
  ...e,
  message: `[custom] ${e.message}`
}));
```

---

## Error Types & Codes

### Standard Error Codes

| Code | Meaning | Retryable | Example |
|------|---------|-----------|---------|
| `INVALID_INPUT` | Client sent bad data | No | Message too long |
| `MISSING_CONTEXT` | Required context unavailable | No | No sessionId |
| `DEPENDENCY_ERROR` | Infrastructure unavailable | **Yes** | Redis timeout |
| `LLM_ERROR` | LLM call failed | **Yes** | Rate limit, timeout |
| `TOOL_ERROR` | Tool invocation failed | **Yes** | API error |
| `TOKEN_BUDGET_EXCEEDED` | Token limit reached | No | Over budget |
| `CANCELLED` | Run was cancelled | No | User stopped |
| `TIMEOUT` | Operation too long | **Yes** | Slow API |
| `UNAUTHORIZED` | Auth failed | No | Bad API key |
| `INTERNAL_ERROR` | Unexpected error | Maybe | Null pointer |

### Defining Error Types

```typescript
// Specific errors for a node
export type PropNodeCustomError =
  | {
      code: "INVALID_INPUT";
      message: string;
    }
  | {
      code: "LLM_ERROR";
      message: string;
      retryable: true;
    }
  | {
      code: "SESSION_ERROR";
      message: string;
      retryable: false;
    };
```

**Key:** Include `retryable` field so worker knows whether to retry.

---

## Automatic Retry Logic

### How It Works

```
Worker receives result:
  ├─ isOk() → advance workflow
  │
  └─ isErr() → check retryable
       ├─ retryable: true
       │   ├─ Attempt < 5 → Retry with exponential backoff
       │   │              (1s, 2s, 4s, 8s, 16s, then fail)
       │   └─ Attempt >= 5 → Move to failed queue
       │
       └─ retryable: false → Move to failed queue immediately
```

### Example

```typescript
// Error that will be retried
return err({
  code: "LLM_ERROR",
  message: "Rate limit exceeded",
  retryable: true  // Will retry automatically
});

// Error that won't be retried
return err({
  code: "INVALID_INPUT",
  message: "Message too long",
  retryable: false  // Permanent failure
});
```

---

## Error Handling Patterns

### Pattern 1: Input Validation

```typescript
const result = schema.safeParse(input);
if (!result.success) {
  return err({
    code: "INVALID_INPUT",
    message: `Validation failed: ${result.error.message}`,
    retryable: false
  });
}

const data = result.data;
```

### Pattern 2: Dependency Error (Retryable)

```typescript
try {
  const messages = await ctx.memory.getSessionMessages(sessionId);
  // ...
} catch (e) {
  ctx.logger.error({ error: e }, "Failed to fetch session messages");

  return err({
    code: "DEPENDENCY_ERROR",
    message: `Session store unavailable: ${e instanceof Error ? e.message : String(e)}`,
    retryable: true  // Will be retried
  });
}
```

### Pattern 3: LLM Error (Retryable)

```typescript
try {
  const response = await ctx.models.invoke("deepseek.chat", messages);
  // ...
} catch (e) {
  ctx.logger.error({ error: e }, "LLM call failed");

  return err({
    code: "LLM_ERROR",
    message: e instanceof Error ? e.message : "Unknown LLM error",
    retryable: true
  });
}
```

### Pattern 4: Tool Error (May Be Retryable)

```typescript
try {
  const response = await fetch(url);
  // ...
} catch (e) {
  const isNetwork = e instanceof TypeError && e.message.includes("fetch");
  
  return err({
    code: "TOOL_ERROR",
    message: `Tool call failed: ${e instanceof Error ? e.message : String(e)}`,
    retryable: isNetwork  // Retry network errors, not 404s
  });
}
```

### Pattern 5: Cascading Errors

```typescript
// Get session or return error
const messages = await ctx.memory.getSessionMessages(sessionId)
  .catch(e => null);

if (!messages) {
  return err({
    code: "DEPENDENCY_ERROR",
    message: "Cannot load session history",
    retryable: true
  });
}
```

---

## Logging with Errors

### Do: Log structured error info

```typescript
// ✓ Good – structured log with error
ctx.logger.error(
  {
    errorCode: "LLM_ERROR",
    errorMessage: e.message,
    sessionId,
    retries: retryCount
  },
  "LLM call failed"
);
```

### Don't: Swallow errors silently

```typescript
// ✗ Bad – silent failure
try {
  await ctx.memory.updateSession(...);
} catch (e) {
  // Oops, error lost
}

// Instead:
try {
  await ctx.memory.updateSession(...);
} catch (e) {
  ctx.logger.warn({ error: e }, "Failed to update session");
  // Continue or return error
}
```

---

## Testing Error Cases

### Mock Successful Executor

```typescript
const ctx = createMockExecutorContext({
  memory: {
    getSessionMessages: async () => [
      { role: "user", content: "hello" }
    ]
  }
});

const result = await nodeCustom(input, ctx);
expect(result.isOk()).toBe(true);
```

### Mock Failed Executor

```typescript
const ctx = createMockExecutorContext({
  memory: {
    getSessionMessages: async () => {
      throw new Error("Redis unavailable");
    }
  }
});

const result = await nodeCustom(input, ctx);
expect(result.isErr()).toBe(true);

if (result.isErr()) {
  expect(result.error.code).toBe("DEPENDENCY_ERROR");
  expect(result.error.retryable).toBe(true);
}
```

---

## Error Flow in Workflows

```
User sends input
  ↓
[guard] Validates
  ├─ err({ code: "INVALID_INPUT", retryable: false })
  │  ↓ → Worker marks permanent failure
  │  ↓ → emit: node.failed
  │  ↓ → Workflow stops
  │
  └─ ok() → proceed
     ↓
     [reason] Calls LLM
       ├─ err({ code: "LLM_ERROR", retryable: true })
       │  ↓ → Worker retries (exponential backoff)
       │  ↓ → If retries exhausted → node.failed
       │  ↓ → Workflow stops
       │
       └─ ok() → proceed
          ↓
          Workflow complete
          ↓
          emit: run.finished
```

---

## Common Mistakes

### ❌ Mistake 1: Silent Failures

```typescript
// Bad – error ignored
try {
  await ctx.memory.updateSession(...);
} catch (e) {
  // Oops, session not updated but no error returned
}
```

**Fix:** Log and return error
```typescript
try {
  await ctx.memory.updateSession(...);
} catch (e) {
  ctx.logger.error({ error: e }, "Update failed");
  return err({ code: "SESSION_ERROR", message: "...", retryable: true });
}
```

### ❌ Mistake 2: Swallowing Stack Traces

```typescript
// Bad – lose error details
catch (e) {
  return err({ message: "Something failed" });
}
```

**Fix:** Include original error
```typescript
catch (e) {
  ctx.logger.error({ error: e }, "Something failed");
  return err({
    code: "INTERNAL_ERROR",
    message: e instanceof Error ? e.message : String(e),
    retryable: false
  });
}
```

### ❌ Mistake 3: Over-Retrying

```typescript
// Bad – retrying non-retryable errors wastes time
return err({
  code: "INVALID_INPUT",
  message: "Message too long",
  retryable: true  // ✗ Will waste retries
});
```

**Fix:** Only retry transient errors
```typescript
// Only network/service errors should be retryable
return err({
  code: "INVALID_INPUT",
  message: "Message too long",
  retryable: false  // ✓ Fail fast
});
```

### ❌ Mistake 4: Overly Broad Error Codes

```typescript
// Bad – vague error
return err({
  code: "ERROR",
  message: "Something went wrong"
});
```

**Fix:** Specific, actionable errors
```typescript
return err({
  code: "LLM_ERROR",
  message: "DeepSeek rate limit exceeded",
  retryable: true
});
```

---

## Debugging Errors

### Check Error Logs

```bash
LOG_LEVEL=debug npm run dev
```

Look for `error` logs with `errorCode` and error message.

### Inspect Queue

```bash
redis-cli
> LLEN bull:nodes:failed       # Failed jobs
> HGETALL bull:nodes:*         # Job details
```

### Replay Failed Job

```bash
# Retry a specific job
redis-cli
> RPUSH bull:nodes:waiting job-data
```

---

## Best Practices

1. **Always return Result** – Never throw from executors
2. **Validate at boundaries** – safeParse input before using
3. **Log structured errors** – Include code, message, context
4. **Mark retryable correctly** – Only transient errors
5. **Test error cases** – Mock failures to ensure handling
6. **Avoid silent failures** – Always log or return error
7. **Include error context** – Help future debuggers understand

---

## Next Steps

1. **Test error handling** → [07-TESTING.md](./07-TESTING.md)
2. **Debug in production** → [08-OBSERVABILITY.md](./08-OBSERVABILITY.md)
3. **Deploy safely** → [09-DEPLOYMENT.md](./09-DEPLOYMENT.md)

---

**Document:** 06-ERROR-HANDLING.md  
**Updated:** 2026-06-04  
**Status:** Ready
