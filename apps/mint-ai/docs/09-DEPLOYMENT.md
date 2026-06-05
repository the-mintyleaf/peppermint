# Deployment & Production

**Purpose:** Deploy mint-ai to production safely and scale it  
**Audience:** DevOps, SREs  
**Reading time:** 15 minutes

---

## Pre-Deployment Checklist

- [ ] All tests passing: `npm test`
- [ ] Type check: `npm run tsc`
- [ ] Build succeeds: `npm run build`
- [ ] Environment variables set in `.env.production`
- [ ] Redis 7+ running and accessible
- [ ] DeepSeek API key valid
- [ ] Logs are structured (JSON format)
- [ ] Metrics exporter configured
- [ ] Error handling tested with mocks
- [ ] Load test completed (see below)

---

## Environment Configuration

### Development (.env)

```env
NODE_ENV=development
LOG_LEVEL=debug
DEEPSEEK_API_KEY=sk-...
VAGENT_REDIS_URL=redis://localhost:6379
VAGENT_PORT=3000
VAGENT_WORKERS=2
```

### Production (.env.production)

```env
NODE_ENV=production
LOG_LEVEL=info
DEEPSEEK_API_KEY=sk-...
VAGENT_REDIS_URL=redis://prod-redis-cluster:6379
VAGENT_PORT=3000
VAGENT_WORKERS=8
VAGENT_JOB_TIMEOUT=30000
VAGENT_SESSION_TTL=86400
VAGENT_MAX_RETRIES=5
VAGENT_BACKOFF_MS=1000
SENTRY_DSN=https://...  # Error tracking
```

### Critical Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `NODE_ENV` | Environment | development |
| `LOG_LEVEL` | Log verbosity | info |
| `DEEPSEEK_API_KEY` | LLM API key | (required) |
| `VAGENT_REDIS_URL` | Redis connection | redis://localhost:6379 |
| `VAGENT_PORT` | Server port | 3000 |
| `VAGENT_WORKERS` | Worker count | 2 |
| `VAGENT_JOB_TIMEOUT` | Max job duration (ms) | 30000 |
| `VAGENT_SESSION_TTL` | Session expiry (s) | 86400 |

---

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy source
COPY . .

# Install dependencies
RUN npm ci --production

# Build
RUN npm run build

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start
CMD ["npm", "run", "start"]
```

### Docker Compose (Local)

```yaml
version: "3.8"

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      LOG_LEVEL: debug
      DEEPSEEK_API_KEY: ${DEEPSEEK_API_KEY}
      VAGENT_REDIS_URL: redis://redis:6379
      VAGENT_PORT: 3000
      VAGENT_WORKERS: 4
    depends_on:
      - redis
    volumes:
      - .:/app
      - /app/node_modules

  worker:
    build: .
    environment:
      NODE_ENV: development
      LOG_LEVEL: debug
      DEEPSEEK_API_KEY: ${DEEPSEEK_API_KEY}
      VAGENT_REDIS_URL: redis://redis:6379
      VAGENT_WORKERS: 8
    depends_on:
      - redis
    command: npm run worker

volumes:
  redis-data:
```

### Build & Run

```bash
# Build image
docker build -t mint-ai:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DEEPSEEK_API_KEY=sk-... \
  -e VAGENT_REDIS_URL=redis://host.docker.internal:6379 \
  mint-ai:latest

# Check health
curl http://localhost:3000/health
```

---

## Kubernetes Deployment

### Deployment YAML

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mint-ai
  namespace: default
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mint-ai
  template:
    metadata:
      labels:
        app: mint-ai
    spec:
      containers:
      - name: api
        image: mint-ai:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: LOG_LEVEL
          value: "info"
        - name: DEEPSEEK_API_KEY
          valueFrom:
            secretKeyRef:
              name: mint-ai-secrets
              key: deepseek-key
        - name: VAGENT_REDIS_URL
          value: "redis://redis-cluster:6379"
        - name: VAGENT_WORKERS
          value: "8"
        resources:
          requests:
            memory: "256Mi"
            cpu: "500m"
          limits:
            memory: "512Mi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: mint-ai
spec:
  type: ClusterIP
  ports:
  - port: 3000
    targetPort: 3000
  selector:
    app: mint-ai

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: mint-ai-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: mint-ai
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Deploy

```bash
# Create secrets
kubectl create secret generic mint-ai-secrets \
  --from-literal=deepseek-key=sk-...

# Deploy
kubectl apply -f deployment.yaml

# Check status
kubectl get pods -l app=mint-ai
kubectl logs -l app=mint-ai -f

# Scale manually
kubectl scale deployment mint-ai --replicas=5
```

---

## Performance Tuning

### Worker Configuration

```typescript
// src/orchestrator/worker/index.ts

const concurrency = parseInt(process.env.VAGENT_WORKERS || "2");
const maxStalledCount = 2;
const lockDuration = 30000;  // 30 seconds
const lockRenewTime = 15000; // 15 seconds

const queue = new Queue("nodes", {
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 1000
    }
  },
  settings: {
    maxStalledCount,
    lockDuration,
    lockRenewTime,
    // Process up to `concurrency` jobs in parallel
    max: concurrency
  }
});

// Process jobs with concurrency
queue.process(concurrency, async (job) => {
  // Job processing logic
});
```

### Capacity Planning

| Scenario | Workers | Capacity |
|----------|---------|----------|
| Light (QA/dev) | 2 | ~20 nodes/sec |
| Medium | 4 | ~80 nodes/sec |
| High | 8 | ~200 nodes/sec |
| Very High | 16 | ~400 nodes/sec |

**Formula:** ~50 nodes/sec per worker (depends on executor complexity)

### Memory & CPU

| Component | CPU | Memory |
|-----------|-----|--------|
| API Server | 0.5 CPU | 256 MB |
| Worker (per core) | 1 CPU | 512 MB |
| Redis | 2 CPU | 2-4 GB |

### Scaling Strategy

1. **Vertical:** More CPU/memory per pod
2. **Horizontal:** More pods/workers
3. **Hybrid:** 4-8 workers per pod, auto-scale pod count

---

## Load Testing

### Test Script (k6)

```javascript
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 20 },   // Ramp up
    { duration: "1m", target: 100 },   // Hold
    { duration: "30s", target: 0 },    // Ramp down
  ],
};

export default function () {
  const url = "http://localhost:3000/v1/runs";
  const payload = JSON.stringify({
    workflowId: "momo.salesbot",
    sessionId: `user-${__VU}-${__ITER}`,
    input: { message: "Hello!" }
  });

  const params = {
    headers: { "Content-Type": "application/json" },
  };

  const res = http.post(url, payload, params);
  check(res, {
    "status is 202": (r) => r.status === 202,
    "response has runId": (r) => JSON.parse(r.body).runId !== undefined,
  });

  sleep(1);
}
```

### Run Load Test

```bash
# Install k6
brew install k6

# Run test
k6 run load-test.js

# Output:
#   iterations..................: 3000  100/s
#   vus............................: 0    100 max
#   http_reqs......................: 3000 100/s  ✓
#   http_req_duration..............: avg=45ms  p(95)=120ms  p(99)=180ms
#   checks..........................: 100%
```

---

## Monitoring & Alerts

### Prometheus Metrics

```bash
# Export metrics (Prometheus format)
curl http://localhost:3000/metrics/prometheus

# Scrape config for Prometheus
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "mint-ai"
    static_configs:
      - targets: ["localhost:3000"]
    metrics_path: "/metrics/prometheus"
```

### Key Alerts

```yaml
groups:
  - name: mint-ai
    rules:
    - alert: HighErrorRate
      expr: rate(executor_error_total[5m]) > 0.05
      for: 5m
      annotations:
        summary: "High executor error rate"

    - alert: QueueBacklog
      expr: bull_queue_waiting > 1000
      for: 5m
      annotations:
        summary: "Job queue backlog > 1000"

    - alert: RedisMemory
      expr: redis_memory_used_bytes > 80000000000
      for: 5m
      annotations:
        summary: "Redis memory > 80 GB"
```

---

## Zero-Downtime Deployment

### Rolling Update Strategy

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # 1 extra pod during update
      maxUnavailable: 0  # No downtime
  minReadySeconds: 10
```

### Drain Gracefully

```typescript
// src/apps/api/index.ts

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, draining gracefully...");

  // Stop accepting new requests
  await fastify.close();

  // Wait for workers to finish current jobs
  await queue.drain();

  process.exit(0);
});
```

### Deployment Steps

```bash
# 1. Build new image
docker build -t mint-ai:v1.2.0 .
docker push registry.example.com/mint-ai:v1.2.0

# 2. Update Kubernetes
kubectl set image deployment/mint-ai \
  api=registry.example.com/mint-ai:v1.2.0

# 3. Wait for rollout
kubectl rollout status deployment/mint-ai

# 4. Verify
curl http://mint-ai:3000/health

# 5. Rollback if needed
kubectl rollout undo deployment/mint-ai
```

---

## Backup & Recovery

### Redis Persistence

```bash
# Enable AOF (Append-Only File)
redis-cli CONFIG SET appendonly yes

# Create snapshot
redis-cli BGSAVE

# Check backup
ls -lah /var/lib/redis/
```

### Backup Strategy

| Data | Method | Frequency |
|------|--------|-----------|
| Session memory | Redis AOF | Real-time |
| Run history | Database | Continuous |
| Workflows | Git | On change |

---

## Troubleshooting Production

### High Latency

```bash
# Check Redis latency
redis-cli --latency

# Monitor slow commands
redis-cli SLOWLOG GET 10

# Check executor times
curl http://localhost:3000/metrics | grep "executor.*duration"
```

### Memory Leak

```bash
# Check memory usage
docker stats mint-ai

# Analyze heap
node --inspect app.js
# Open chrome://inspect

# Check Redis keys
redis-cli DBSIZE
redis-cli KEYS "session:*" | wc -l
```

### Queue Stuck

```bash
# Check stuck jobs
redis-cli LLEN bull:nodes:active

# Clear dead jobs
redis-cli DEL bull:nodes:failed
redis-cli DEL bull:nodes:paused

# Restart workers
docker restart mint-ai
```

---

## Scaling Checklist

- [ ] Redis is separate from API/workers
- [ ] Session TTL configured (not too long)
- [ ] Max memory limits set on containers
- [ ] Auto-scaling policy defined
- [ ] Health checks configured
- [ ] Graceful shutdown implemented
- [ ] Logs shipped to central location
- [ ] Metrics exported to monitoring system
- [ ] Alerts configured for errors
- [ ] Runbooks created for common issues

---

## Next Steps

1. **Monitor in production** → [08-OBSERVABILITY.md](./08-OBSERVABILITY.md)
2. **Reference API** → [10-REFERENCE.md](./10-REFERENCE.md)

---

**Document:** 09-DEPLOYMENT.md  
**Updated:** 2026-06-04  
**Status:** Ready
