# sAgent v2 – AI-First Workflow Orchestration

> A stateless Node.js microservice for executing graph-based AI workflows with LLM reasoning, tool invocation, and real-time streaming.

## 🚀 Quick Start

```bash
# 1. Setup
npm install
cp .env.example .env
# Edit .env: add DEEPSEEK_API_KEY

# 2. Start Redis
npm run redis-start

# 3. Start server
npm run dev

# 4. Test
curl -X POST http://localhost:3000/v1/runs/chat \
  -d '{"sessionId":"test","message":"Hi!"}'
```

**Response:**
```json
{
  "reply": "Hello! How can I help you today?",
  "sessionId": "test"
}
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[QUICK_START.md](QUICK_START.md)** | 5-minute setup & cheat sheet |
| **[USAGE_GUIDE.md](USAGE_GUIDE.md)** | Complete API & usage reference |
| **[docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)** | Architecture & system design |
| **[docs/EXECUTOR_PATTERN.md](docs/EXECUTOR_PATTERN.md)** | Building custom executors |
| **[ENV_SETUP_GUIDE.md](ENV_SETUP_GUIDE.md)** | Environment configuration |
| **[.env.example](.env.example)** | All environment variables |

## 🎯 What Is sAgent?

**sAgent v2** is a production-ready platform for orchestrating **AI-first workflows**:

- **Graph-based execution** – Define workflows as directed graphs of nodes
- **LLM reasoning** – Integrate DeepSeek, OpenAI, or Claude
- **Tool invocation** – AI autonomously calls APIs (max 3 iterations)
- **Session memory** – Bounded conversation history with summarization
- **Real-time streaming** – Token-by-token updates via Server-Sent Events
- **Type-safe** – TypeScript + Zod validation throughout
- **Horizontally scalable** – Distributed job processing via BullMQ

## 🏗️ Key Concepts

### Workflows
A directed graph of **nodes** (execution units) connected by **edges**.

```
[guard.policy] ──> [agents.reasoning] ──> [tools.apiCall]
   (validate)        (AI reasoning)       (call API)
```

### Sessions
User conversations with:
- **Message history** – Last N messages (bounded)
- **Session summary** – Persistent context across turns

### Runs
Single workflow execution with:
- Status tracking (queued → running → completed/failed)
- Real-time event streaming
- Result storage

## 🔌 API Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/runs` | POST | Enqueue workflow |
| `/v1/runs/:runId/stream` | GET | Stream events (SSE) |
| `/v1/runs/chat` | POST | Synchronous chat |
| `/v1/runs/:runId` | GET | Get run status |
| `/v1/health` | GET | Health check |

### Example: Enqueue a Workflow

```bash
curl -X POST http://localhost:3000/v1/runs \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "momo.salesbot",
    "sessionId": "user-123",
    "input": { "message": "Hello" }
  }'

# Response:
# {"runId":"run-abc-123","status":"queued"}
```

### Example: Stream Events

```bash
curl -N http://localhost:3000/v1/runs/run-abc-123/stream

# Output:
# event: run.started
# event: node.started
# event: token
# data: {"partial":"Hello"}
# event: node.finished
# event: run.finished
```

## 📦 Core Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **Fastify API** | `src/apps/api/` | HTTP server + routes |
| **BullMQ Queue** | `src/orchestrator/queue/` | Job persistence & retry |
| **Worker Pool** | `src/orchestrator/worker/` | Job processing |
| **Executor Registry** | `src/executors/` | Maps node kind → function |
| **Session Memory** | `src/shared/memory/` | Redis-backed history |
| **Event Bus** | `src/shared/events/` | Pub/sub for SSE |

## ⚙️ Requirements

- **Node.js** 20 LTS
- **Redis** 7+
- **DeepSeek API key** (get from [platform.deepseek.com](https://platform.deepseek.com/api/keys))

## 🔧 Environment Variables

**Required:**
- `DEEPSEEK_API_KEY` – LLM API key

**Recommended:**
- `VAGENT_PORT` – Server port (default: 3000)
- `VAGENT_REDIS_URL` – Redis connection (default: redis://localhost:6379)
- `NODE_ENV` – Environment (default: development)
- `LOG_LEVEL` – Logging level (default: info)

See [.env.example](.env.example) for all 40+ variables.

## 🚀 Common Patterns

### Multi-Turn Conversation
```bash
# Turn 1
curl -X POST http://localhost:3000/v1/runs/chat \
  -d '{"sessionId":"alice","message":"What is AI?"}'

# Turn 2 (context preserved)
curl -X POST http://localhost:3000/v1/runs/chat \
  -d '{"sessionId":"alice","message":"How does it work?"}'
```

### Real-Time Streaming
```javascript
const res = await fetch("http://localhost:3000/v1/runs", {
  method: "POST",
  body: JSON.stringify({
    workflowId: "momo.salesbot",
    sessionId: "user-123",
    input: { message: "Hello" }
  })
});

const { runId } = await res.json();
const es = new EventSource(`http://localhost:3000/v1/runs/${runId}/stream`);

es.addEventListener("token", (e) => {
  console.log(JSON.parse(e.data).partial);
});
```

### Tool-Calling Loop
Configure tools in workflow → AI autonomously calls APIs → Reports results.

## 📖 Workflows

### momo.salesbot
Multi-turn sales conversations with AI reasoning.

```
guard.policy (validate) ──> agents.reasoning (LLM reply)
```

### business.onboarding
Guided onboarding with API integration and tool-calling.

```
guard.policy ──> agents.reasoning (with tools: createBusinessRecord)
```

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3000/v1/health
```

### Simple Test
```bash
curl -X POST http://localhost:3000/v1/runs/chat \
  -d '{"sessionId":"test","message":"Hi!"}'
```

### With Logs
```bash
LOG_LEVEL=debug npm run dev
```

## 📊 Architecture Highlights

✅ **Type-Safe** – Full TypeScript + Zod validation
✅ **Observable** – Structured logging, metrics, tracing
✅ **Scalable** – Distributed workers, horizontal scaling
✅ **Reliable** – Automatic retry, graceful shutdown
✅ **Testable** – Dependency injection, mockable context
✅ **Documented** – Comprehensive guides & examples

## 🔒 Security

- ✅ No secrets in source code (use .env)
- ✅ Input validation on all boundaries
- ✅ CORS configured
- ✅ API token support
- ✅ Structured logging with redaction

See [ENV_SETUP_GUIDE.md](ENV_SETUP_GUIDE.md) for production security practices.

## 📈 Performance

| Operation | Latency |
|-----------|---------|
| Guard validation | <50ms |
| LLM inference | 1-5s |
| Tool call | 500ms-2s |
| End-to-end workflow | 3-10s |

## 🚢 Deployment

### Docker
```bash
docker build -t sagent .
docker run -e DEEPSEEK_API_KEY=sk-... sagent
```

### Kubernetes
See deployment docs (coming soon).

### Scaling
```bash
# Multiple workers on same Redis
VAGENT_WORKER_CONCURRENCY=16 npm run dev
```

## 🤝 Contributing

See [docs/EXECUTOR_PATTERN.md](docs/EXECUTOR_PATTERN.md) to:
- Implement custom executors
- Add new node types
- Create custom workflows

Follow standards in [docs/rules.md](docs/rules.md).

## 📚 Learning Path

1. **New users:** Start with [QUICK_START.md](QUICK_START.md)
2. **API reference:** See [USAGE_GUIDE.md](USAGE_GUIDE.md)
3. **Architecture:** Read [docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)
4. **Building:** Check [docs/EXECUTOR_PATTERN.md](docs/EXECUTOR_PATTERN.md)

## 🐛 Troubleshooting

**Redis connection refused?**
```bash
npm run redis-start
redis-cli ping  # Should return PONG
```

**DeepSeek key invalid?**
- Get key from [platform.deepseek.com/api/keys](https://platform.deepseek.com/api/keys)
- Add to .env: `DEEPSEEK_API_KEY=sk-...`
- Restart: `npm run dev`

**Port already in use?**
```bash
VAGENT_PORT=3001 npm run dev
```

See [USAGE_GUIDE.md#troubleshooting](USAGE_GUIDE.md#troubleshooting) for more.

## 📞 Support

- 📖 **Docs:** [USAGE_GUIDE.md](USAGE_GUIDE.md)
- ⚙️ **Setup:** [ENV_SETUP_GUIDE.md](ENV_SETUP_GUIDE.md)
- 🏗️ **Architecture:** [docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)
- 🛠️ **Development:** [docs/EXECUTOR_PATTERN.md](docs/EXECUTOR_PATTERN.md)
- ❓ **FAQ:** [USAGE_GUIDE.md#troubleshooting](USAGE_GUIDE.md#troubleshooting)

## 📝 License

(License details to be added)

## 🎉 Quick Links

- [5-Minute Quick Start](QUICK_START.md)
- [Complete Usage Guide](USAGE_GUIDE.md)
- [Environment Setup](ENV_SETUP_GUIDE.md)
- [API Reference](USAGE_GUIDE.md#api-reference)
- [Examples](USAGE_GUIDE.md#examples)
- [Troubleshooting](USAGE_GUIDE.md#troubleshooting)

---

**Status:** Production Ready ✅
**Last Updated:** 2025-01-13
**Version:** 2.0

Get started with [QUICK_START.md](QUICK_START.md) → [USAGE_GUIDE.md](USAGE_GUIDE.md) → [docs/](docs/)
