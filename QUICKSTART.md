# Quick Start: Run mintflow + mint-ai

## 1️⃣ Install Redis (One-time setup)

Open a **new WSL terminal** (separate from VS Code):

```bash
sudo apt-get update
sudo apt-get install -y redis-server
redis-server
```

Keep this terminal open. You should see:

```
Ready to accept connections
```

## 2️⃣ Terminal 1 — Start mint-ai API (port 3000)

```bash
cd /home/decoffee/Projects/peppermint/apps/mint-ai
pnpm dev
```

Wait for:

```
API running on port 3000
```

## 3️⃣ Terminal 2 — Start mintflow (port 3001)

```bash
cd /home/decoffee/Projects/peppermint/apps/mintflow
pnpm dev
```

Wait for:

```
▲ Next.js X.X.X
- Local: http://localhost:3001
```

## 4️⃣ Open in Browser

Go to: **http://localhost:3001/admin**

## 5️⃣ Test the Chat

1. Type a message: **"Hello, what can you do?"**
2. Wait 1-2 seconds
3. See DeepSeek's response

That's it! 🎉

---

## If Something Goes Wrong

| Problem                                  | Solution                                               |
| ---------------------------------------- | ------------------------------------------------------ |
| "connect ECONNREFUSED" in mint-ai        | Redis isn't running. Check the Redis terminal.         |
| "Cannot reach api"                       | Make sure mint-ai terminal shows "port 3000"           |
| Chat shows "Sorry, something went wrong" | Check browser DevTools (F12) Network tab for errors    |
| Port already in use                      | Kill the process: `lsof -i :3000` then `kill -9 <PID>` |

---

## Architecture at a Glance

```
mintflow (port 3001)
    ↓ sends message
mint-ai API (port 3000)
    ↓ queues job
BullMQ + Redis
    ↓ executes workflow
DeepSeek LLM
    ↓ returns response
Chat UI displays answer
```

See `IMPLEMENTATION_SUMMARY.md` for full details.
