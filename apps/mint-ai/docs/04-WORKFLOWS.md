# Creating Workflows

**Purpose:** Learn how to define and create workflows  
**Audience:** Workflow designers, developers  
**Reading time:** 15 minutes

---

## What Is a Workflow?

A workflow is a **directed acyclic graph (DAG)** of nodes and edges. Each node is a unit of work (validate input, reason with LLM, call API). Edges define the flow between nodes.

```
[guard.policy] → [agent.reasoning]
```

```
[guard.policy] → [agent.reasoning] → [tool.apicall]
```

```
[guard.policy] → [agent.reasoning]
                    ├→ [tool.apicall] → [agent.summary]
                    └→ [agent.error_handler]
```

---

## Workflow Structure

```typescript
interface Workflow {
  id: string;           // Unique identifier (e.g., "momo.salesbot")
  nodes: Node[];        // Array of nodes
  edges: Edge[];        // Array of edges
}

interface Node {
  id: string;           // Unique within workflow (e.g., "guard")
  kind: string;         // Node type (e.g., "system.guardPolicy")
  config?: Record<...>; // Node-specific settings
}

interface Edge {
  source: string;       // Node ID
  target: string;       // Node ID
}
```

---

## Node Types

### System Nodes

#### 1. system.guardPolicy

Validates input and allows/denies execution.

```typescript
{
  id: "guard",
  kind: "system.guardPolicy",
  config: {
    maxLength: 5000,              // Max input length
    denyPatterns: ["badword"],    // Deny if matches
    allowEmpty: false             // Reject empty input
  }
}
```

**Input:**

```typescript
{
  message: string;
}
```

**Output (on success):**

```typescript
{
  allow: true;
}
```

**Output (on failure):**

```typescript
{ allow: false, reason: "Message too long" }
```

**Next node logic:**

- If `allow === true` → proceed to successors
- If `allow === false` → stop workflow

#### 2. system.noop

Pass-through node (no-op). Useful for testing or placeholder nodes.

```typescript
{
  id: "noop",
  kind: "system.noop"
}
```

### Agent Nodes

#### agents.reasoning

Invoke LLM with optional tool-calling.

```typescript
{
  id: "reasoner",
  kind: "agents.reasoning",
  config: {
    chatModel: "deepseek.chat",           // LLM to use
    systemPrompt: "You are helpful...",   // System prompt
    temperature: 0.7,                     // Sampling temperature
    maxTokens: 1000,                      // Output limit
    tools: [
      {
        name: "searchProducts",
        description: "Search product catalog",
        config: {
          url: "https://api.example.com/search",
          method: "POST"
        }
      }
    ],
    memoryLimit: 10  // Keep last 10 messages
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
  reply: string; // Model's response
  summary: Record<string, any>; // Updated session summary
}
```

### Tool Nodes

#### tools.apicall

Make HTTP calls to external APIs.

```typescript
{
  id: "fetch_product",
  kind: "tools.apicall",
  config: {
    url: "https://api.example.com/products",
    method: "GET",
    headers: {
      Authorization: "Bearer {{token}}"
    },
    body: {
      query: "{{searchQuery}}"
    },
    timeout: 5000
  }
}
```

**Input:**

```typescript
{
  // Any data needed for templating
}
```

**Output:**

```typescript
{
  status: number;
  body: Record<string, any>; // API response
  headers: Record<string, string>;
}
```

---

## Creating a Workflow

### Step 1: Define Structure

```typescript
// src/workflows/momo/example/index.ts

import { Workflow } from "@/types";

export const workflowExampleFlow: Workflow = {
  id: "momo.example",

  nodes: [
    {
      id: "guard",
      kind: "system.guardPolicy",
      config: {
        maxLength: 5000,
      },
    },
    {
      id: "reason",
      kind: "agents.reasoning",
      config: {
        chatModel: "deepseek.chat",
        systemPrompt: "You are helpful.",
        temperature: 0.7,
      },
    },
  ],

  edges: [{ source: "guard", target: "reason" }],
};
```

### Step 2: Register Workflow

```typescript
// src/workflows/registry.ts

import { workflowExampleFlow } from "./momo/example";

export const workflowRegistry = {
  "momo.example": workflowExampleFlow,
  // ... other workflows
};
```

### Step 3: Test via API

```bash
curl -X POST http://localhost:3000/v1/runs \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "momo.example",
    "sessionId": "user-123",
    "input": { "message": "Hello!" }
  }'
```

---

## Example: Sales Bot Workflow

```typescript
// src/workflows/momo/salesbot/index.ts

import { Workflow } from "@/types";

export const workflowSalesBot: Workflow = {
  id: "momo.salesbot",

  nodes: [
    // 1. Validate input
    {
      id: "guard",
      kind: "system.guardPolicy",
      config: {
        maxLength: 5000,
        denyPatterns: ["malicious_word"],
      },
    },

    // 2. Fetch prior context (optional)
    {
      id: "memory_fetch",
      kind: "memory.session.fetch",
      config: {
        sessionId: "{{sessionId}}",
        summaryKey: "salesbot",
      },
    },

    // 3. AI reasoning with tools
    {
      id: "reason",
      kind: "agents.reasoning",
      config: {
        chatModel: "deepseek.chat",
        systemPrompt: `You are a helpful sales assistant.
Your job is to help customers find products and make purchases.
Be friendly, professional, and concise.`,
        temperature: 0.7,
        maxTokens: 1000,
        tools: [
          {
            name: "searchProducts",
            description: "Search for products in our catalog",
            config: {
              url: "https://api.example.com/v1/search",
              method: "POST",
            },
          },
          {
            name: "createOrder",
            description: "Create a new order",
            config: {
              url: "https://api.example.com/v1/orders",
              method: "POST",
            },
          },
        ],
      },
    },

    // 4. Update session memory (optional)
    {
      id: "memory_update",
      kind: "memory.session.update",
      config: {
        sessionId: "{{sessionId}}",
        summaryKey: "salesbot",
      },
    },
  ],

  edges: [
    { source: "guard", target: "memory_fetch" },
    { source: "memory_fetch", target: "reason" },
    { source: "reason", target: "memory_update" },
  ],
};
```

**Workflow execution:**

```
User: "I want running shoes under $150"
  ↓
[guard] Validate message length ✓
  ↓
[memory_fetch] Get session history and summary
  ↓
[reason] Call DeepSeek
  Input: message + history + summary + tools
  Action: searchProducts({ query: "running shoes under $150" })
  Result: [Nike Air Zoom $120, Adidas UltraBoost $140]
  Output: "Found Nike Air Zoom ($120) and Adidas UltraBoost ($140)..."
  ↓
[memory_update] Update session
  Messages: [new exchange]
  Summary: { products_shown: 2, user_budget: "$150" }
  ↓
Response sent to client
```

---

## Branching Workflows

### Conditional Branching (Future)

With a **router node**, you can branch based on LLM output:

```typescript
{
  nodes: [
    {
      id: "reason",
      kind: "agents.reasoning",
      config: {
        tools: [{ name: "classify_intent" }]
      }
    },
    {
      id: "route",
      kind: "agents.router",
      config: {
        // AI decides which path: purchase, support, feedback
      }
    },
    {
      id: "handle_purchase",
      kind: "agents.reasoning",
      config: { systemPrompt: "You help with purchases..." }
    },
    {
      id: "handle_support",
      kind: "agents.reasoning",
      config: { systemPrompt: "You provide support..." }
    }
  ],
  edges: [
    { source: "reason", target: "route" },
    { source: "route", target: "handle_purchase" },  // branch A
    { source: "route", target: "handle_support" }    // branch B
  ]
}
```

---

## Template Variables

Within workflow config, you can use template variables that are substituted at runtime:

```typescript
{
  id: "fetch",
  kind: "tools.apicall",
  config: {
    url: "https://api.example.com/users/{{userId}}/profile",
    headers: {
      "Session-ID": "{{sessionId}}"
    }
  }
}
```

Available variables:

- `{{sessionId}}` – Current session ID
- `{{runId}}` – Current run ID
- `{{nodeId}}` – Current node ID
- Custom variables from executor output

---

## Best Practices

### 1. Start with Guard Node

Always validate input first:

```typescript
edges: [
  { source: "guard", target: "reason" }, // ✓ Guard first
];
```

Not:

```typescript
edges: [
  { source: "reason", target: "guard" }, // ✗ Process before guarding
];
```

### 2. Use Meaningful Node IDs

```typescript
// ✓ Clear
{ id: "search_products", kind: "tools.apicall" }

// ✗ Unclear
{ id: "api1", kind: "tools.apicall" }
```

### 3. Document Complex Workflows

```typescript
// ✓ Documented
export const workflowComplex: Workflow = {
  id: "momo.complex",
  // Description: Validates input, fetches history, reasons, calls APIs, updates memory
  nodes: [...]
};

// ✗ Undocumented
export const wf: Workflow = {
  id: "test",
  nodes: [...]
};
```

### 4. Keep Workflows Focused

```typescript
// ✓ Single responsibility
{
  id: "momo.search",
  nodes: [guard, reason, fetch]  // Search products
}

// ✗ Too much
{
  id: "momo.everything",
  nodes: [guard, search, buy, refund, feedback]  // Too many concerns
}
```

### 5. Configuration Over Code

```typescript
// ✓ Configurable
{
  id: "reason",
  kind: "agents.reasoning",
  config: {
    systemPrompt: "You help with {{topic}}"
  }
}

// ✗ Hardcoded in executor
// executor code has hardcoded prompts
```

---

## Debugging Workflows

### Check Workflow Definition

```bash
redis-cli
> GET workflow:momo.salesbot
```

### Monitor Execution

```bash
# Terminal 1
npm run dev

# Terminal 2
curl -N http://localhost:3000/v1/runs/run-abc-123/stream
```

Watch events in real-time.

### Check Node Errors

```bash
LOG_LEVEL=debug npm run dev
```

Look for `node.failed` events with error details.

---

## Workflow Examples

See `src/workflows/` for complete examples:

- `momo/salesbot/` – Sales bot workflow
- `momo/onboarding/` – Onboarding flow
- (Add more as needed)

---

## Next Steps

1. **Write an executor** → [05-EXECUTORS.md](./05-EXECUTORS.md)
2. **Handle errors** → [06-ERROR-HANDLING.md](./06-ERROR-HANDLING.md)
3. **Test your workflow** → [07-TESTING.md](./07-TESTING.md)

---

**Document:** 04-WORKFLOWS.md  
**Updated:** 2026-06-04  
**Status:** Ready
