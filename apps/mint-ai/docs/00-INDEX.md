# mint-ai Documentation Index

**Last Updated:** 2026-06-04  
**Project:** mint-ai (sAgent v2) – AI-first Workflow Orchestration Platform

---

## 🚀 Quick Start

**New to the project?** Start here:

1. **[01-OVERVIEW.md](./01-OVERVIEW.md)** – What is mint-ai? (5 min read)
2. **[02-GETTING-STARTED.md](./02-GETTING-STARTED.md)** – Setup & run locally (10 min)
3. **[03-ARCHITECTURE.md](./03-ARCHITECTURE.md)** – How it works (15 min)

---

## 📚 Documentation Structure

### Core Documentation (Start Here)

| Document | Purpose | Audience |
|----------|---------|----------|
| **[01-OVERVIEW.md](./01-OVERVIEW.md)** | What is mint-ai and why it exists | Everyone |
| **[02-GETTING-STARTED.md](./02-GETTING-STARTED.md)** | Setup, run, test the system | Developers |
| **[03-ARCHITECTURE.md](./03-ARCHITECTURE.md)** | System design and data flows | Engineers |

### Implementation Guides

| Document | Purpose | For |
|----------|---------|-----|
| **[04-WORKFLOWS.md](./04-WORKFLOWS.md)** | How to define and create workflows | Workflow designers |
| **[05-EXECUTORS.md](./05-EXECUTORS.md)** | How to write executors | Backend engineers |
| **[06-ERROR-HANDLING.md](./06-ERROR-HANDLING.md)** | Error patterns and Result types | All engineers |
| **[07-TESTING.md](./07-TESTING.md)** | Testing strategies | QA & engineers |

### Advanced Topics

| Document | Purpose | For |
|----------|---------|-----|
| **[08-OBSERVABILITY.md](./08-OBSERVABILITY.md)** | Logging, metrics, debugging | DevOps, architects |
| **[09-DEPLOYMENT.md](./09-DEPLOYMENT.md)** | Production deployment & scaling | DevOps |
| **[10-REFERENCE.md](./10-REFERENCE.md)** | API endpoints, types, registries | Quick lookup |

### Guides by Role

#### Workflow Designer
1. Start: [01-OVERVIEW.md](./01-OVERVIEW.md)
2. Learn: [04-WORKFLOWS.md](./04-WORKFLOWS.md)
3. Reference: [10-REFERENCE.md](./10-REFERENCE.md) → Workflow Schema

#### Backend Engineer
1. Setup: [02-GETTING-STARTED.md](./02-GETTING-STARTED.md)
2. Learn: [03-ARCHITECTURE.md](./03-ARCHITECTURE.md)
3. Build: [05-EXECUTORS.md](./05-EXECUTORS.md)
4. Debug: [08-OBSERVABILITY.md](./08-OBSERVABILITY.md)

#### DevOps / SRE
1. Understand: [03-ARCHITECTURE.md](./03-ARCHITECTURE.md)
2. Deploy: [09-DEPLOYMENT.md](./09-DEPLOYMENT.md)
3. Monitor: [08-OBSERVABILITY.md](./08-OBSERVABILITY.md)

#### Tech Lead / Architect
1. Overview: [01-OVERVIEW.md](./01-OVERVIEW.md)
2. Architecture: [03-ARCHITECTURE.md](./03-ARCHITECTURE.md)
3. Best Practices: [05-EXECUTORS.md](./05-EXECUTORS.md) + [06-ERROR-HANDLING.md](./06-ERROR-HANDLING.md)
4. Scaling: [09-DEPLOYMENT.md](./09-DEPLOYMENT.md)

---

## 🎯 Common Tasks

### "I want to..."

#### ...understand the system
→ Read: [01-OVERVIEW.md](./01-OVERVIEW.md) + [03-ARCHITECTURE.md](./03-ARCHITECTURE.md)

#### ...create a new workflow
→ Read: [04-WORKFLOWS.md](./04-WORKFLOWS.md)  
→ Example: `src/workflows/momo/` folder

#### ...write a new executor (node type)
→ Read: [05-EXECUTORS.md](./05-EXECUTORS.md)  
→ Template: See "Executor Template" section

#### ...debug an issue
→ Read: [08-OBSERVABILITY.md](./08-OBSERVABILITY.md)  
→ Check: Redis data, queue status, logs

#### ...deploy to production
→ Read: [09-DEPLOYMENT.md](./09-DEPLOYMENT.md)  
→ Checklist: See "Pre-deployment Checklist"

#### ...add error handling
→ Read: [06-ERROR-HANDLING.md](./06-ERROR-HANDLING.md)  
→ Pattern: Use Result types everywhere

#### ...test my changes
→ Read: [07-TESTING.md](./07-TESTING.md)  
→ Pattern: Mock the ExecutorContext

#### ...look up an API
→ Read: [10-REFERENCE.md](./10-REFERENCE.md)  
→ Find: REST endpoints, types, registries

---

## 📊 Documentation Statistics

| Category | Files | Purpose |
|----------|-------|---------|
| Core Docs | 10 | Main documentation (this is it!) |
| Legacy | 44 | Old/archived docs (not maintained) |
| **Total** | 54 | - |

---

## 🔑 Key Concepts at a Glance

### Workflow Graph
A workflow is a **directed graph of nodes and edges**. Execution is **graph traversal**: when a node completes, the runner finds successor nodes and enqueues them.

### Executor
Code that runs a node. Signature: `async (input, ctx) => Result<Output, Error>`

### Node Types
- **System nodes** – Control flow (guard, noop)
- **Agent nodes** – AI reasoning with tools
- **Tool nodes** – External integrations (API calls, LLMs)

### Session Memory
- **Messages** (Redis LIST) – Bounded chat history
- **Summary** (Redis JSON) – Persistent context (budget, phase, etc.)

### Result Types
`Result<T, E>` – Type-safe error handling. No surprise exceptions; errors are part of the type.

### Job Queue
BullMQ (Redis-backed) – Reliable job persistence, automatic retry with exponential backoff, horizontal scaling via workers.

---

## 🚨 Critical Design Principles

1. **Stateless Node.js** – All state in Redis or Django, not in-memory
2. **Graph-based** – Workflows are DAGs; execution is graph traversal
3. **Type-safe** – Zod schemas at every boundary
4. **Observable** – Structured logs, metrics, event streams
5. **Resilient** – Automatic retry, graceful errors, cancellation support

---

## 📞 Document Status

| Doc | Status | Last Updated |
|-----|--------|--------------|
| 01-OVERVIEW.md | ✅ Ready | 2026-06-04 |
| 02-GETTING-STARTED.md | ✅ Ready | 2026-06-04 |
| 03-ARCHITECTURE.md | ✅ Ready | 2026-06-04 |
| 04-WORKFLOWS.md | ✅ Ready | 2026-06-04 |
| 05-EXECUTORS.md | ✅ Ready | 2026-06-04 |
| 06-ERROR-HANDLING.md | ✅ Ready | 2026-06-04 |
| 07-TESTING.md | ✅ Ready | 2026-06-04 |
| 08-OBSERVABILITY.md | ✅ Ready | 2026-06-04 |
| 09-DEPLOYMENT.md | ✅ Ready | 2026-06-04 |
| 10-REFERENCE.md | ✅ Ready | 2026-06-04 |

---

## 🗂️ File Organization

```
docs/
├── 00-INDEX.md (this file)
├── 01-OVERVIEW.md
├── 02-GETTING-STARTED.md
├── 03-ARCHITECTURE.md
├── 04-WORKFLOWS.md
├── 05-EXECUTORS.md
├── 06-ERROR-HANDLING.md
├── 07-TESTING.md
├── 08-OBSERVABILITY.md
├── 09-DEPLOYMENT.md
└── 10-REFERENCE.md
```

Old/legacy docs have been archived and are not maintained. Use the 10 core docs above.

---

**Questions?** Check the relevant doc for your role, or search for keywords in [10-REFERENCE.md](./10-REFERENCE.md).
