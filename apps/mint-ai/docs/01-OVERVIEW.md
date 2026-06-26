# mint-ai: AI-First Workflow Orchestration Platform

**Project:** mint-ai (sAgent v2)  
**Type:** Node.js Microservice  
**Purpose:** Execute complex, graph-based workflows powered by Large Language Models (LLMs)

---

## What Is mint-ai?

**In One Sentence:**  
A scalable, type-safe platform for defining and executing multi-step AI workflows with built-in memory, tool-calling, and real-time streaming.

**In Plain English:**  
You describe a workflow as a series of connected steps (nodes). Each step can validate input, reason with an LLM, call APIs, or invoke tools. The platform executes these steps in order, remembers context from prior turns, and streams results back to the client in real-time.

---

## Real-World Examples

### Example 1: Sales Bot

```
User: "I want running shoes under $150"
  ↓
Guard: Validate message length ✓
  ↓
AI Reasoning: Invoke LLM
  - Context: Prior conversation history
  - Tools: searchProducts, createOrder
  - Action: Search API for products
  ↓
Response: "I found Nike Air Zoom ($120) and Adidas UltraBoost ($140). Which interests you?"
  ↓
Memory: Update session summary with user's budget and preferences
```

### Example 2: Onboarding Flow

```
User: "I want to onboard my business"
  ↓
Guard: Validate input ✓
  ↓
AI Reasoning: Collect business info via conversation
  - Tools: createBusinessRecord
  - Action: Ask "What's your business name?"
  ↓
User: "TechCorp Inc"
  ↓
AI Reasoning: Continue
  - Action: Call createBusinessRecord API
  - Update: Store business ID in session
  ↓
Response: "Great! Your business TechCorp Inc is registered as BIZ-123"
```

---

## Key Features

### ✅ What We Have

| Feature                   | Description                                                 |
| ------------------------- | ----------------------------------------------------------- |
| **Graph-based Workflows** | Define workflows as connected nodes (DAGs)                  |
| **Type-Safe Execution**   | Zod schemas at every boundary; no surprise runtime errors   |
| **Session Memory**        | Bounded chat history + persistent summaries                 |
| **Tool-Calling**          | AI invokes APIs, interprets results, decides next steps     |
| **Job Queue**             | BullMQ-powered; reliable, retry-safe, horizontally scalable |
| **SSE Streaming**         | Real-time events to clients (tokens, lifecycle events)      |
| **LLM Support**           | DeepSeek, with extensible model registry                    |
| **Observability**         | Structured logging, metrics, event streaming                |
| **Error Handling**        | Result types; no silent failures                            |

### 🔄 Planned

- Router node (dynamic branching based on LLM output)
- Planner node (auto-generate steps at runtime)
- Multi-model support (OpenAI, Claude, Gemini)
- Django integration (long-term memory, audit logs)
- Caching (LLM responses, API results)
- Authentication (OAuth2, JWT)

---

## Core Concepts

### 1. Workflows

A **workflow** is a directed graph of **nodes** and **edges**.

```typescript
interface Workflow {
  id: string; // e.g., "momo.salesbot"
  nodes: Node[]; // Execution steps
  edges: Edge[]; // Connections: { source, target }
}
```

Example:

```
[guard.policy] → [agent.reasoning]
```

### 2. Nodes & Executors

A **node** is a unit of work. An **executor** is the code that runs it.

**Three types:**

1. **System nodes** – Control flow (validate input, noop)
2. **Agent nodes** – AI reasoning with tools
3. **Tool nodes** – External integrations (API calls, LLMs)

### 3. Session Memory

Two Redis data structures per session:

- **Messages** (LIST) – Recent chat history (bounded)
- **Summary** (JSON) – Persistent context (budget, phase, intent, etc.)

Why? Bounded memory prevents token bloat. Summaries preserve critical context.

### 4. Tool-Calling Loop

When an AI node has tools, it can:

1. See the tool definitions
2. Choose to call one
3. Get the result
4. Use the result to refine its response
5. Repeat up to 3 times

Example:

```
Turn 1: "Show me running shoes"
  → Model calls: searchProducts("running shoes")
  → API returns: [Nike Air Zoom ($120), ...]
  → Model recap: "Found Nike Air Zoom for $120. Want details?"

Turn 2: "Buy it"
  → Model calls: createOrder({ productId: 1 })
  → API returns: { orderId: "ORD-456" }
  → Model recap: "Order ORD-456 confirmed!"
```

### 5. Result Types

Executors return `Result<Success, Error>` instead of throwing.

Why? **Type safety.** The compiler enforces error handling; no surprise exceptions.

```typescript
const result = await executor(input, ctx);

if (result.isOk()) {
  // Success path
  const output = result.value;
} else {
  // Error path
  const error = result.error;
}
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│ CLIENT APPLICATION                                  │
│ (Web UI, Mobile, Third-party Integration)           │
└────────────────┬────────────────────────────────────┘
                 │ REST/SSE
┌────────────────▼────────────────────────────────────┐
│ NODE.JS API (Fastify)                               │
│ • POST /v1/runs - Enqueue workflow                  │
│ • GET /v1/runs/:id/stream - Real-time events        │
└────────────────┬────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼──────────┐  ┌──▼──────────────┐
│ REDIS            │  │ DJANGO (Future) │
│ • Job Queues     │  │ • Workflows     │
│ • Session Memory │  │ • Long-term Mem │
└────────┬──────────┘  └─────────────────┘
         │
┌────────▼──────────────────────────────────┐
│ WORKFLOW ENGINE                           │
│ • BullMQ Worker Pool                      │
│ • Executor Registry                       │
│ • Graph Traversal Runner                  │
└──────────────────────────────────────────┘
```

**Key insight:** Execution is **stateless in Node.js**. All state lives in Redis or Django. Workers are horizontally scalable.

---

## Execution Flow (High Level)

```
1. Client POSTs to /v1/runs
   ↓
2. API enqueues job to BullMQ
   ↓
3. Worker pulls job, loads workflow definition
   ↓
4. Worker identifies entry node(s) and enqueues them
   ↓
5. Worker pulls node job, resolves executor by kind
   ↓
6. Executor runs (may call LLM, APIs, etc.)
   ↓
7. Executor returns Result<Output, Error>
   ↓
8. Worker advances workflow (find successor nodes)
   ↓
9. If no successors → run complete
   ↓
10. SSE stream delivers all events to client
```

---

## Why mint-ai?

### Problem

Building multi-turn AI agents is complex:

- Need to manage conversation history (but bounded)
- Need to handle LLM tool-calling loops
- Need reliable job scheduling with retries
- Need to observe what's happening (logs, events)
- Need type safety (no silent failures)

### Solution

mint-ai abstracts away the complexity. Define workflows as graphs of typed nodes. The platform handles:

- ✅ Job scheduling & retry logic
- ✅ Session memory management
- ✅ Tool-calling loops
- ✅ Type validation
- ✅ Error handling
- ✅ Observability

Result: You focus on business logic (node definitions, workflows), not infrastructure.

---

## Key Principles

1. **Stateless Node.js** – Horizontal scalability; all state in Redis
2. **Graph-based** – Flexible, composable, testable workflows
3. **Type-safe** – Zod schemas enforce contracts; catch bugs early
4. **Observable** – Structured logs, metrics, event streams
5. **Resilient** – Automatic retry, graceful degradation, cancellation
6. **Developer-first** – Clear abstractions, examples, docs

---

## What's Next?

1. **Setup your environment** → [02-GETTING-STARTED.md](./02-GETTING-STARTED.md)
2. **Understand the architecture** → [03-ARCHITECTURE.md](./03-ARCHITECTURE.md)
3. **Create your first workflow** → [04-WORKFLOWS.md](./04-WORKFLOWS.md)
4. **Write a custom executor** → [05-EXECUTORS.md](./05-EXECUTORS.md)

---

**Document:** 01-OVERVIEW.md  
**Updated:** 2026-06-04  
**Status:** Ready
