# Getting Started with mint-ai

**Setup time:** ~10 minutes  
**Prerequisites:** Node.js 20+, Redis 7+

---

## Prerequisites

### Install Node.js
```bash
# Check version (should be 20+)
node --version  # v20.10.0 or higher
```

[Download Node.js](https://nodejs.org/)

### Install Redis
```bash
# macOS (Homebrew)
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis-server

# Docker
docker run -d -p 6379:6379 redis:7

# Verify
redis-cli ping  # Should return PONG
```

### Get DeepSeek API Key
Sign up at [https://deepseek.com/](https://deepseek.com/) and get your API key.

---

## Setup

### 1. Clone & Install

```bash
cd ~/Projects/zutsel/apps/mint-ai
npm install
```

### 2. Configure Environment

```bash
# Copy example .env
cp .env.example .env

# Edit .env with your settings
nano .env
```

Required variables:
```env
# LLM
DEEPSEEK_API_KEY=sk-...          # Your DeepSeek API key

# Redis
VAGENT_REDIS_URL=redis://localhost:6379

# Server
VAGENT_PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# LLM Models
DEEPSEEK_MODEL=deepseek-chat     # Model ID
```

### 3. Start Redis

```bash
# If using Homebrew
brew services start redis

# Or via Docker
docker run -d -p 6379:6379 redis:7

# Verify connection
redis-cli ping
```

### 4. Start the Server

```bash
# Development mode (API + workers in same process)
npm run dev

# Or separately:
npm run dev-api      # API server on :3000
npm run dev-worker   # Worker processes
```

You should see:
```
[INFO] Fastify listening on 0.0.0.0:3000
[INFO] BullMQ workers started
```

---

## Quick Test

### Test 1: Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{ "status": "ok" }
```

### Test 2: Enqueue a Workflow

```bash
curl -X POST http://localhost:3000/v1/runs \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "momo.salesbot",
    "sessionId": "test-user-1",
    "input": { "message": "Hi! I want running shoes." }
  }'
```

Response:
```json
{
  "runId": "run-abc-123",
  "workflowId": "momo.salesbot",
  "status": "queued"
}
```

### Test 3: Stream Events (SSE)

Open another terminal:

```bash
# Replace run-abc-123 with the runId from previous response
curl -N http://localhost:3000/v1/runs/run-abc-123/stream
```

You'll see events:
```
event: run.started
data: {"runId":"run-abc-123","timestamp":"..."}

event: node.started
data: {"nodeId":"guard.policy","timestamp":"..."}

event: node.finished
data: {"nodeId":"guard.policy","result":{"allow":true},"timestamp":"..."}

...

event: run.finished
data: {"runId":"run-abc-123","finalResult":{...},"timestamp":"..."}
```

### Test 4: Synchronous Chat

```bash
curl -X POST http://localhost:3000/v1/runs/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-user-1",
    "message": "What shoes do you recommend?"
  }'
```

Response (waits up to 30 seconds):
```json
{
  "reply": "Based on your interests, I'd recommend...",
  "sessionId": "test-user-1"
}
```

---

## Understanding the Request Flow

When you POST to `/v1/runs`:

```
1. API validates input
2. Enqueues job to "runs" queue
3. Returns 202 (Accepted) immediately
   ↓
4. Worker pulls job
5. Loads workflow definition (momo.salesbot)
6. Identifies entry node (guard.policy)
7. Enqueues guard.policy job to "nodes" queue
8. Emits: run.started
   ↓
9. Worker pulls guard.policy job
10. Calls executor: nodeGuardPolicy(input, ctx)
11. Executor validates message length
12. If valid → enqueue next node (agent.reasoning)
13. Emits: node.finished
    ↓
14. Worker pulls agent.reasoning job
15. Calls executor: nodeAIReasoning(input, ctx)
16. Executor:
    - Fetches session history from Redis
    - Calls DeepSeek LLM
    - Updates session memory
17. Emits: node.finished
    ↓
18. No more successors → workflow complete
19. Emits: run.finished
    ↓
20. SSE stream delivers all events to client
```

---

## Checking Logs

### View Logs

```bash
# All logs
npm run dev

# Specific log level
LOG_LEVEL=debug npm run dev
LOG_LEVEL=warn npm run dev
```

Log format (structured JSON):
```json
{
  "level": "info",
  "runId": "run-abc-123",
  "nodeId": "guard.policy",
  "message": "Node execution started",
  "timestamp": "2026-06-04T10:00:00Z"
}
```

### View Redis Data

```bash
redis-cli

# List all keys
> KEYS *

# Check session messages
> LRANGE session:test-user-1:messages 0 -1

# Check session summary
> GET session:test-user-1:summary

# Monitor queue
> LLEN bull:runs:waiting
> LLEN bull:nodes:waiting
```

---

## Troubleshooting

### Error: `ECONNREFUSED` (Redis)

**Problem:** Redis not running

**Solution:**
```bash
# Check Redis status
redis-cli ping

# Start Redis
brew services start redis
# or
docker run -d -p 6379:6379 redis:7
```

### Error: `DEEPSEEK_API_KEY not found`

**Problem:** Environment variable not set

**Solution:**
```bash
# Edit .env
echo "DEEPSEEK_API_KEY=sk-..." >> .env

# Or set inline
DEEPSEEK_API_KEY=sk-... npm run dev
```

### Error: `Workflow not found: momo.salesbot`

**Problem:** Workflow not registered

**Solution:**
Check `src/workflows/registry.ts` to ensure the workflow is exported.

### Workflow hangs (never completes)

**Problem:** Worker crashed or node errored

**Solution:**
```bash
# Check logs
LOG_LEVEL=debug npm run dev

# Check queue jobs
redis-cli
> LLEN bull:nodes:active

# Kill and restart
npm run dev
```

---

## Next Steps

1. **Understand the architecture** → [03-ARCHITECTURE.md](./03-ARCHITECTURE.md)
2. **Create a workflow** → [04-WORKFLOWS.md](./04-WORKFLOWS.md)
3. **Write an executor** → [05-EXECUTORS.md](./05-EXECUTORS.md)

---

## Project Structure (Quick Tour)

```
src/
├── apps/
│   └── api/              # Fastify server, routes
├── executors/            # Node executors (where logic lives)
├── orchestrator/         # BullMQ worker, runner
├── shared/               # Redis, logger, memory, events
├── types/                # Zod schemas
└── workflows/            # Workflow definitions

docs/
├── 01-OVERVIEW.md
├── 02-GETTING-STARTED.md (you are here)
├── 03-ARCHITECTURE.md
├── ...
```

---

## Scripts

```bash
# Development
npm run dev              # API + workers (foreground)
npm run dev-api         # API server only
npm run dev-worker      # Workers only

# Building
npm run build           # Compile TypeScript
npm run tsc             # Type check

# Testing
npm run test            # Run tests
npm test -- --watch    # Watch mode

# Database
npm run redis-start     # Start Redis (macOS)
npm run redis-cli       # Connect to Redis CLI
```

---

**Document:** 02-GETTING-STARTED.md  
**Updated:** 2026-06-04  
**Status:** Ready
