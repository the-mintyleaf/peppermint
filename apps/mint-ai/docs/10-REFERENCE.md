# API & Type Reference

**Purpose:** Quick lookup for APIs, types, and schemas  
**Audience:** Developers  
**Reading time:** 10 minutes (for lookup)

---

## REST API Endpoints

### 1. Enqueue Workflow Run

```
POST /v1/runs
Content-Type: application/json

Request:
{
  "workflowId": "momo.salesbot",
  "sessionId": "user-123",
  "input": { "message": "Hello!" }
}

Response (202 Accepted):
{
  "runId": "run-abc-123",
  "workflowId": "momo.salesbot",
  "status": "queued"
}
```

### 2. Stream Run Events (SSE)

```
GET /v1/runs/{runId}/stream

Response (streaming):
event: run.started
data: {"runId":"run-abc-123","timestamp":"2026-06-04T..."}

event: node.started
data: {"nodeId":"guard.policy","timestamp":"..."}

event: node.finished
data: {"nodeId":"guard.policy","result":{"allow":true},"timestamp":"..."}

event: token
data: {"partial":"Hello"}

event: run.finished
data: {"runId":"run-abc-123","finalResult":{...},"timestamp":"..."}
```

### 3. Get Run Status

```
GET /v1/runs/{runId}

Response (200 OK):
{
  "runId": "run-abc-123",
  "status": "finished",  // queued, running, finished, failed
  "result": {...},
  "createdAt": "2026-06-04T10:00:00Z",
  "completedAt": "2026-06-04T10:00:05Z"
}
```

### 4. Synchronous Chat

```
POST /v1/runs/chat
Content-Type: application/json

Request:
{
  "sessionId": "user-123",
  "message": "What is 2+2?"
}

Response (200 OK, waits up to 30s):
{
  "reply": "2+2 equals 4",
  "sessionId": "user-123"
}
```

### 5. Health Check

```
GET /health

Response (200 OK):
{
  "status": "ok",
  "redis": "connected",
  "uptime": 3600
}
```

### 6. Metrics

```
GET /metrics

Response (200 OK):
{
  "system.guardPolicy.success.count": 42,
  "system.guardPolicy.success.avg_duration_ms": 45,
  "agents.reasoning.error.count": 3,
  "agents.reasoning.tokens.total": 50000,
  ...
}
```

---

## Workflow Schema

```typescript
interface Workflow {
  id: string; // e.g., "momo.salesbot"
  nodes: Node[];
  edges: Edge[];
}

interface Node {
  id: string; // e.g., "guard", "reason"
  kind: string; // e.g., "system.guardPolicy", "agents.reasoning"
  config?: Record<string, any>;
}

interface Edge {
  source: string; // Node ID
  target: string; // Node ID
}
```

---

## Node Types & Configs

### system.guardPolicy

**Validates input.**

```typescript
{
  id: "guard",
  kind: "system.guardPolicy",
  config: {
    maxLength?: number;        // Default: 5000
    denyPatterns?: string[];   // Deny if matches
    allowEmpty?: boolean;      // Default: false
  }
}
```

**Input:**

```typescript
{
  message: string;
}
```

**Output (ok):**

```typescript
{
  allow: true;
}
```

**Output (err):**

```typescript
{ allow: false, reason: string }
```

---

### system.noop

**No-op, pass-through node.**

```typescript
{
  id: "noop",
  kind: "system.noop"
}
```

**Input/Output:** Any

---

### agents.reasoning

**Invoke LLM with optional tool-calling.**

```typescript
{
  id: "reason",
  kind: "agents.reasoning",
  config: {
    chatModel: string;                    // e.g., "deepseek.chat"
    systemPrompt?: string;
    temperature?: number;                 // 0.0-1.0, default: 0.7
    maxTokens?: number;                   // Default: 1000
    tools?: Array<{
      name: string;
      description: string;
      config: Record<string, any>;
    }>;
    memoryLimit?: number;                 // Default: 10 messages
  }
}
```

**Input:**

```typescript
{
  message: string;
}
```

**Output:**

```typescript
{
  reply: string;
  summary: Record<string, any>;
}
```

---

### tools.apicall

**Make HTTP API calls.**

```typescript
{
  id: "fetch",
  kind: "tools.apicall",
  config: {
    url: string;                          // e.g., "https://api.example.com/search"
    method?: string;                      // GET, POST, etc. Default: GET
    headers?: Record<string, string>;
    body?: Record<string, any>;
    timeout?: number;                     // milliseconds, default: 5000
  }
}
```

**Input:** Any (for templating)

**Output:**

```typescript
{
  status: number;
  body: Record<string, any>;
  headers: Record<string, string>;
}
```

---

## Error Types

### Standard Error Codes

```typescript
type ErrorCode =
  | "INVALID_INPUT"
  | "MISSING_CONTEXT"
  | "DEPENDENCY_ERROR"
  | "LLM_ERROR"
  | "TOOL_ERROR"
  | "TOKEN_BUDGET_EXCEEDED"
  | "CANCELLED"
  | "TIMEOUT"
  | "UNAUTHORIZED"
  | "INTERNAL_ERROR";
```

### Error Object

```typescript
interface ExecutorError {
  code: ErrorCode;
  message: string;
  retryable?: boolean; // true = will be retried, false = permanent failure
}
```

---

## Result Type

```typescript
type Result<T, E> = Ok<T> | Err<E>;

interface Ok<T> {
  isOk(): true;
  isErr(): false;
  value: T;
  map<U>(fn: (val: T) => U): Result<U, E>;
  andThen<U, E2>(fn: (val: T) => Result<U, E2>): Result<U, E | E2>;
  unwrap(): T; // Throws if Err
  unwrapOr(def: T): T;
}

interface Err<E> {
  isOk(): false;
  isErr(): true;
  error: E;
  mapErr(fn: (err: E) => E2): Result<T, E2>;
  unwrapOr(def: T): T;
}
```

---

## ExecutorContext

```typescript
interface ExecutorContext {
  // IDs
  requestId: string;
  runId: string;
  nodeId: string;
  sessionId?: string;

  // Dependencies
  redis: Redis; // Redis client
  logger: Logger; // Pino logger
  models: ModelRegistry; // LLM adapters
  metrics: Metrics; // Observability
  config: RuntimeConfig; // Settings
  memory: SessionMemory; // Session store
  eventBus: EventBus; // SSE pub/sub

  // Methods
  isCancelled(): Promise<boolean>;
  emitEvent(type: string, data: any): Promise<void>;
}
```

---

## SessionMemory

```typescript
interface SessionMemory {
  getSessionMessages(sessionId: string, limit?: number): Promise<Message[]>;

  addSessionMessage(sessionId: string, message: Message): Promise<void>;

  getSessionSummary(sessionId: string): Promise<Record<string, any> | null>;

  updateSessionSummary(
    sessionId: string,
    summary: Record<string, any>,
  ): Promise<void>;

  clearSession(sessionId: string): Promise<void>;
}

interface Message {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
}
```

---

## Executor Signature

```typescript
type Executor<I, O, E> = (
  input: unknown,
  ctx: ExecutorContext,
) => Promise<Result<O, E>>;
```

---

## Executor Registry

```typescript
const executorRegistry = {
  "system.guardPolicy": nodeGuardPolicy,
  "system.noop": nodeNoop,
  "agents.reasoning": nodeAIReasoning,
  "tools.apicall": toolApiCall,
  // ... more executors
};
```

**Lookup:**

```typescript
const executor = executorRegistry["agents.reasoning"];
const result = await executor(input, ctx);
```

---

## Event Types

```typescript
type EventType =
  | "run.started"
  | "run.finished"
  | "run.failed"
  | "node.started"
  | "node.finished"
  | "node.failed"
  | "token"
  | "error";

interface Event {
  type: EventType;
  runId: string;
  nodeId?: string;
  result?: Record<string, any>;
  error?: ExecutorError;
  partial?: string; // For "token" events
  timestamp: string; // ISO 8601
}
```

---

## Common Patterns

### Pattern 1: Create & Register Executor

```typescript
// 1. Define types
export const schemaPropNodeCustomInput = z.object({...});
export type PropNodeCustomInput = z.infer<typeof schemaPropNodeCustomInput>;

// 2. Implement executor
export async function nodeCustom(input, ctx) {
  const parsed = schemaPropNodeCustomInput.safeParse(input);
  if (!parsed.success) return err({ code: "INVALID_INPUT", ... });
  // ... logic ...
  return ok({ reply: "..." });
}

// 3. Register
executorRegistry["custom.node"] = nodeCustom;
```

### Pattern 2: Handle Results

```typescript
const result = await executor(input, ctx);

if (result.isOk()) {
  console.log(result.value);
} else {
  console.log(result.error.message);
}
```

### Pattern 3: Chain Results

```typescript
const result = ok(data)
  .map((d) => transform(d))
  .andThen((d) => fetchMore(d))
  .mapErr((e) => ({ ...e, context: "myExecutor" }));
```

---

## Configuration

```typescript
interface RuntimeConfig {
  // LLM
  defaultSystemPrompt?: string;
  maxTokensPerRun?: number;

  // Memory
  sessionMemoryLimit?: number; // Default: 10 messages
  sessionTTL?: number; // Default: 86400 (24h)

  // Jobs
  maxRetries?: number; // Default: 5
  backoffMS?: number; // Default: 1000 (exponential)
  jobTimeout?: number; // Default: 30000 (30s)

  // Tools
  toolTimeout?: number; // Default: 5000
  maxToolCalls?: number; // Default: 3

  // Guard
  guardPolicy?: {
    maxLength?: number;
    denyPatterns?: string[];
  };
}
```

---

## Environment Variables

```bash
# Server
NODE_ENV=production                    # development | production
VAGENT_PORT=3000                       # HTTP port
VAGENT_WORKERS=8                       # Worker count
LOG_LEVEL=info                         # debug | info | warn | error

# Redis
VAGENT_REDIS_URL=redis://localhost:6379

# LLM
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_MODEL=deepseek-chat

# Timeouts & Limits
VAGENT_JOB_TIMEOUT=30000               # Job max duration (ms)
VAGENT_SESSION_TTL=86400               # Session expiry (seconds)
VAGENT_MAX_RETRIES=5                   # Max job retries
VAGENT_BACKOFF_MS=1000                 # Initial backoff (ms)

# Monitoring
SENTRY_DSN=https://...                 # Error tracking
```

---

## Common Error Messages

| Error                   | Cause                   | Fix              |
| ----------------------- | ----------------------- | ---------------- |
| `Workflow not found: X` | Workflow not registered | Add to registry  |
| `Unknown executor: Y`   | Executor not registered | Add to registry  |
| `Invalid input: ...`    | Zod validation failed   | Check schema     |
| `Redis timeout`         | Redis unavailable       | Check connection |
| `Rate limit exceeded`   | LLM provider limit hit  | Wait & retry     |
| `Session not found`     | Session expired or lost | New session      |

---

## Useful Commands

```bash
# Development
npm run dev              # API + workers
npm run dev-api         # API only
npm run dev-worker      # Workers only

# Building
npm run build           # TypeScript compilation
npm run tsc             # Type check
npm test                # Run tests

# Database
npm run redis-start     # Start Redis (macOS)
npm run redis-cli       # Connect to Redis
redis-cli FLUSHDB       # Clear all data

# API Testing
curl -X POST http://localhost:3000/v1/runs \
  -H "Content-Type: application/json" \
  -d '{"workflowId":"momo.salesbot","sessionId":"test","input":{"message":"Hi"}}'
```

---

## Useful Links

- [Zod Documentation](https://zod.dev/)
- [Redis Documentation](https://redis.io/docs/)
- [Fastify Documentation](https://www.fastify.io/docs/latest/)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [DeepSeek API](https://deepseek.com/)
- [Server-Sent Events (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

---

**Document:** 10-REFERENCE.md  
**Updated:** 2026-06-04  
**Status:** Ready
