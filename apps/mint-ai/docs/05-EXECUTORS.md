# Writing Executors

**Purpose:** Learn how to write custom node executors  
**Audience:** Backend engineers  
**Reading time:** 20 minutes

---

## What Is an Executor?

An **executor** is a function that implements a node's logic. It:

1. Receives input and context
2. Performs work (validate, call LLM, HTTP request, etc.)
3. Returns a typed Result (success or error)

```typescript
async function nodeCustom(
  input: PropNodeCustomInput,
  ctx: ExecutorContext,
): Promise<Result<PropNodeCustomOutput, PropNodeCustomError>> {
  // Validate
  // Execute logic
  // Return ok(...) or err(...)
}
```

---

## Anatomy of an Executor

### File Structure

```
src/executors/nodes/agents/custom/
├── index.ts           # Main executor function
├── custom.type.ts     # Input/output/error types
├── custom.test.ts     # Unit tests
└── README.md          # Documentation
```

### 1. Type Definitions (custom.type.ts)

```typescript
import { z } from "zod";

// Input schema – validates what the caller sends
export const schemaPropNodeCustomInput = z.object({
  sessionId: z.string(),
  message: z.string().max(5000, "Message too long"),
  config: z.record(z.string()).optional(),
});

export type PropNodeCustomInput = z.infer<typeof schemaPropNodeCustomInput>;

// Output schema – what executor returns on success
export const schemaPropNodeCustomOutput = z.object({
  reply: z.string(),
  summary: z.record(z.string()),
});

export type PropNodeCustomOutput = z.infer<typeof schemaPropNodeCustomOutput>;

// Error type – possible error outcomes
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

### 2. Executor Implementation (index.ts)

```typescript
import { ExecutorContext } from "@/shared/executor-context";
import { Result, ok, err } from "@/shared/result";
import {
  PropNodeCustomInput,
  PropNodeCustomOutput,
  PropNodeCustomError,
  schemaPropNodeCustomInput,
} from "./custom.type";

export async function nodeCustom(
  input: unknown,
  ctx: ExecutorContext,
): Promise<Result<PropNodeCustomOutput, PropNodeCustomError>> {
  // Step 1: Validate input at boundary
  const parseResult = schemaPropNodeCustomInput.safeParse(input);
  if (!parseResult.success) {
    ctx.logger.warn({ errors: parseResult.error.issues }, "Invalid input");
    return err({
      code: "INVALID_INPUT",
      message: `Invalid input: ${parseResult.error.message}`,
    });
  }

  const { sessionId, message } = parseResult.data;

  // Step 2: Structured logging (includes runId, nodeId, sessionId)
  ctx.logger.info(
    { sessionId, messageLen: message.length },
    "Starting custom node",
  );

  // Step 3: Check if run was cancelled
  if (await ctx.isCancelled()) {
    ctx.logger.warn("Run was cancelled");
    return err({
      code: "SESSION_ERROR",
      message: "Run was cancelled",
      retryable: false,
    });
  }

  try {
    // Step 4: Use context dependencies
    const messages = await ctx.memory.getSessionMessages(sessionId, 10);
    const summary = await ctx.memory.getSessionSummary(sessionId);

    // Step 5: Implement business logic
    const reply = "Your response here";
    const newSummary = { ...summary, lastAction: "custom" };

    // Step 6: Update persistent state
    await ctx.memory.addSessionMessage(sessionId, {
      role: "user",
      content: message,
    });
    await ctx.memory.addSessionMessage(sessionId, {
      role: "assistant",
      content: reply,
    });
    await ctx.memory.updateSessionSummary(sessionId, newSummary);

    // Step 7: Record metrics
    ctx.metrics.recordExecutorSuccess("agents.custom", 500);

    // Step 8: Log completion
    ctx.logger.info({ replyLen: reply.length }, "Custom node completed");

    // Step 9: Return success
    return ok({
      reply,
      summary: newSummary,
    });
  } catch (e) {
    // Step 10: Handle errors
    ctx.logger.error({ error: e }, "Custom node failed");

    ctx.metrics.recordExecutorError("agents.custom", "EXECUTION_ERROR", 500);

    return err({
      code: "LLM_ERROR",
      message: e instanceof Error ? e.message : String(e),
      retryable: true, // Will be retried by worker
    });
  }
}
```

### 3. Register Executor

```typescript
// src/executors/index.ts

import { nodeCustom } from "./nodes/agents/custom";

export const executorRegistry = {
  "agents.custom": nodeCustom,
  // ... other executors
};
```

### 4. Test the Executor

```typescript
import { nodeCustom } from "./index";
import { createMockExecutorContext } from "@/shared/executor-context";

describe("nodeCustom", () => {
  it("should handle valid input", async () => {
    // Create mock context
    const ctx = createMockExecutorContext({
      sessionId: "test-session",
      memory: {
        getSessionMessages: async () => [],
        addSessionMessage: async () => {},
        getSessionSummary: async () => null,
        updateSessionSummary: async () => {},
      },
    });

    // Call executor
    const result = await nodeCustom(
      { sessionId: "test-session", message: "hello" },
      ctx,
    );

    // Assert
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.reply).toBeDefined();
      expect(result.value.summary).toBeDefined();
    }
  });

  it("should reject invalid input", async () => {
    const ctx = createMockExecutorContext();
    const result = await nodeCustom(
      { sessionId: "test", message: "" }, // Empty message
      ctx,
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe("INVALID_INPUT");
    }
  });

  it("should handle LLM errors", async () => {
    const ctx = createMockExecutorContext({
      memory: {
        getSessionMessages: async () => {
          throw new Error("Redis connection failed");
        },
      },
    });

    const result = await nodeCustom(
      { sessionId: "test", message: "hello" },
      ctx,
    );

    expect(result.isErr()).toBe(true);
  });
});
```

---

## Using ExecutorContext

The **ExecutorContext** provides all dependencies. Never use singletons directly.

```typescript
// ✓ Use context
const logger = ctx.logger;
logger.info("Starting");

// ✗ Don't use singletons
import { logger as globalLogger } from "@/shared/logging";
globalLogger.info("Starting"); // Hard to mock, test
```

### Available Methods

```typescript
// Logging
ctx.logger.info({ data }, "message");
ctx.logger.warn({ data }, "message");
ctx.logger.error({ error }, "message");

// Session memory
await ctx.memory.getSessionMessages(sessionId, limit);
await ctx.memory.addSessionMessage(sessionId, { role, content });
await ctx.memory.updateSessionSummary(sessionId, summary);
await ctx.memory.getSessionSummary(sessionId);

// LLM models
const model = ctx.models.getModel("deepseek.chat");
const response = await model.invoke(messages, options);

// Metrics
ctx.metrics.recordExecutorSuccess(executorName, duration);
ctx.metrics.recordExecutorError(executorName, errorCode, duration);
ctx.metrics.recordTokens(runId, { input, output, total });

// Redis (ephemeral storage)
await ctx.redis.set(key, value, "EX", ttl);
const value = await ctx.redis.get(key);

// Events (SSE streaming)
await ctx.emitEvent("token", { partial: "hello" });

// Runtime info
ctx.runId; // Current run ID
ctx.nodeId; // Current node ID
ctx.sessionId; // Current session ID
ctx.requestId; // Request trace ID

// Config
ctx.config.defaultSystemPrompt;
ctx.config.maxTokensPerRun;

// Cancellation
const cancelled = await ctx.isCancelled();
```

---

## Example: System Guard Node

```typescript
// src/executors/nodes/system/nodeGuardPolicy/index.ts

import { ExecutorContext } from "@/shared/executor-context";
import { Result, ok, err } from "@/shared/result";
import {
  PropNodeGuardPolicyInput,
  PropNodeGuardPolicyOutput,
  PropNodeGuardPolicyError,
  schemaPropNodeGuardPolicyInput,
} from "./nodeGuardPolicy.type";

export async function nodeGuardPolicy(
  input: unknown,
  ctx: ExecutorContext,
): Promise<Result<PropNodeGuardPolicyOutput, PropNodeGuardPolicyError>> {
  // Validate input
  const parseResult = schemaPropNodeGuardPolicyInput.safeParse(input);
  if (!parseResult.success) {
    return err({
      code: "INVALID_INPUT",
      message: "Invalid guard policy input",
    });
  }

  const { message } = parseResult.data;
  const config = ctx.config.guardPolicy ?? {};

  ctx.logger.info({ messageLen: message.length }, "Validating input");

  // Check length
  const maxLength = config.maxLength ?? 5000;
  if (message.length > maxLength) {
    ctx.logger.warn(
      { messageLen: message.length, maxLength },
      "Message too long",
    );
    return ok({
      allow: false,
      reason: "Message exceeds maximum length",
    });
  }

  // Check deny patterns
  const denyPatterns = config.denyPatterns ?? [];
  for (const pattern of denyPatterns) {
    if (message.includes(pattern)) {
      ctx.logger.warn({ pattern }, "Message matches deny pattern");
      return ok({
        allow: false,
        reason: "Message contains blocked content",
      });
    }
  }

  // All checks passed
  ctx.logger.info("Input validation passed");
  return ok({
    allow: true,
  });
}
```

---

## Example: Tool Calling (Advanced)

```typescript
export async function nodeAIReasoning(
  input: unknown,
  ctx: ExecutorContext
): Promise<Result<...>> {
  // ... validation and setup ...

  const tools = config.tools ?? [];

  // Build system prompt
  const systemPrompt = config.systemPrompt ?? "You are helpful.";
  const toolsDescription = formatToolDescriptions(tools);
  const fullSystemPrompt = `${systemPrompt}\n\n${toolsDescription}`;

  // Prepare messages
  const messages = [
    { role: "system", content: fullSystemPrompt },
    ...sessionMessages,
    { role: "user", content: input.message }
  ];

  // Tool-calling loop (max 3 iterations)
  let response: LLMResponse | null = null;
  let toolCalls = 0;
  const maxToolCalls = 3;

  while (toolCalls < maxToolCalls) {
    // Call LLM
    try {
      response = await ctx.models.invoke("deepseek.chat", messages);
    } catch (e) {
      return err({
        code: "LLM_ERROR",
        message: "LLM call failed",
        retryable: true
      });
    }

    // Check if model wants to call tools
    if (!response.toolCalls || response.toolCalls.length === 0) {
      // Model returned final response
      break;
    }

    // Execute tools
    for (const toolCall of response.toolCalls) {
      ctx.logger.info({ toolName: toolCall.name }, "Executing tool");

      const tool = tools.find(t => t.name === toolCall.name);
      if (!tool) {
        messages.push({
          role: "tool",
          content: "Tool not found"
        });
        continue;
      }

      try {
        // Execute the tool (e.g., HTTP request)
        const toolResult = await executeTool(toolCall, tool, ctx);

        // Add result to messages for next LLM call
        messages.push({
          role: "tool",
          content: JSON.stringify(toolResult)
        });

        ctx.logger.info({ toolName: toolCall.name }, "Tool executed");
      } catch (e) {
        messages.push({
          role: "tool",
          content: `Error: ${e instanceof Error ? e.message : String(e)}`
        });
      }
    }

    toolCalls++;
  }

  // Parse final response
  const reply = response?.content ?? "";
  const output = parseJson(reply);

  // Update session memory
  await ctx.memory.addSessionMessage(ctx.sessionId!, {
    role: "user",
    content: input.message
  });
  await ctx.memory.addSessionMessage(ctx.sessionId!, {
    role: "assistant",
    content: output.reply
  });
  await ctx.memory.updateSessionSummary(ctx.sessionId!, output.summary);

  return ok({
    reply: output.reply,
    summary: output.summary
  });
}

async function executeTool(
  toolCall: ToolCall,
  tool: ToolDefinition,
  ctx: ExecutorContext
): Promise<any> {
  // HTTP request with templating
  const url = interpolateTemplate(tool.config.url, toolCall.args);
  const headers = interpolateTemplate(tool.config.headers ?? {}, toolCall.args);

  const response = await fetch(url, {
    method: tool.config.method ?? "GET",
    headers,
    body: tool.config.method === "GET" ? undefined : JSON.stringify(toolCall.args)
  });

  if (!response.ok) {
    throw new Error(`Tool call failed: ${response.statusText}`);
  }

  return response.json();
}

function formatToolDescriptions(tools: ToolDefinition[]): string {
  return tools
    .map(tool => `- ${tool.name}: ${tool.description}`)
    .join("\n");
}
```

---

## Error Handling Patterns

### Pattern 1: Validate and Return Error

```typescript
const result = schema.safeParse(input);
if (!result.success) {
  return err({
    code: "INVALID_INPUT",
    message: result.error.message,
  });
}
```

### Pattern 2: Catch and Return Retryable Error

```typescript
try {
  await ctx.redis.set(key, value);
} catch (e) {
  ctx.logger.error({ error: e }, "Redis error");
  return err({
    code: "DEPENDENCY_ERROR",
    message: "Redis unavailable",
    retryable: true,
  });
}
```

### Pattern 3: Cascading Results

```typescript
const messages = await ctx.memory
  .getSessionMessages(sessionId, 10)
  .catch(() => null);

if (!messages) {
  return err({
    code: "SESSION_ERROR",
    message: "Failed to load session",
    retryable: true,
  });
}
```

---

## Best Practices

### 1. Validate at Boundaries

```typescript
// ✓ Validate input
const parsed = schema.safeParse(input);
if (!parsed.success) return err(...);

// ✗ Don't assume input is valid
const { message } = input as PropInput;  // Dangerous
```

### 2. Use Context, Not Singletons

```typescript
// ✓ Use context
ctx.logger.info("Message");
ctx.redis.get(key);

// ✗ Don't use globals
logger.info("Message");
redis.get(key);
```

### 3. Log Structured Data

```typescript
// ✓ Structured
ctx.logger.info({ sessionId, count: 5, duration: 123 }, "Processed");

// ✗ String interpolation
ctx.logger.info(
  `Session ${sessionId} processed ${count} items in ${duration}ms`,
);
```

### 4. Return Explicit Errors

```typescript
// ✓ Clear error
return err({
  code: "LLM_ERROR",
  message: "Rate limit exceeded",
  retryable: true,
});

// ✗ Vague
return err({ message: "Something went wrong" });
```

### 5. Record Metrics

```typescript
// ✓ Observable
ctx.metrics.recordTokens(ctx.runId, { input: 100, output: 50 });
ctx.metrics.recordExecutorSuccess("agents.reasoning", 1500);

// ✗ Silent
// No metrics recorded
```

### 6. Test with Mocks

```typescript
// ✓ Testable
const ctx = createMockExecutorContext({ ... });
const result = await nodeCustom(input, ctx);

// ✗ Hard to test
// Executor uses global redis, logger, etc.
```

---

## Checklist: New Executor

- [ ] Create `src/executors/nodes/{category}/{name}/`
- [ ] Create `{name}.type.ts` with input/output/error types
- [ ] Create `index.ts` with executor function
- [ ] Validate input with Zod.safeParse()
- [ ] Use `ctx` for all dependencies
- [ ] Return `Result<Output, Error>`
- [ ] Add structured logging at key points
- [ ] Record metrics for observability
- [ ] Register in `src/executors/index.ts`
- [ ] Write unit tests with mock context
- [ ] Add to workflow and test end-to-end
- [ ] Document in `README.md` or workflow docs

---

## Next Steps

1. **Handle errors properly** → [06-ERROR-HANDLING.md](./06-ERROR-HANDLING.md)
2. **Test your executor** → [07-TESTING.md](./07-TESTING.md)
3. **Debug issues** → [08-OBSERVABILITY.md](./08-OBSERVABILITY.md)

---

**Document:** 05-EXECUTORS.md  
**Updated:** 2026-06-04  
**Status:** Ready
