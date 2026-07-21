# Flows

End-to-end sequences that span more than one entity. Each step names the
endpoint, the key inputs, and the branches the UI must handle. Field/error detail
lives in the entity files — this is the choreography.

`core` exposes only the two infrastructure probes, so it has a single, simple
flow. Business-level multi-entity flows live in the owning apps' packs.

## Liveness / readiness probe

Used by infra monitoring, load-balancer health checks, and deploy verification —
not by the product UI.

1. `GET /health/` → `200 { "status": "ok" }` while the process is alive.
   - **No DB check** — stays `200` even if the database is down. Use this only to
     answer "is the process up?"
2. `GET /ready/` → `200 { "status": "ready" }` when the DB connection succeeds.
   - `503 { "status": "not ready" }` → the database is unreachable; the instance
     should be pulled from the traffic pool until it recovers.

> Decide on the **HTTP status**, not the body string (the string just mirrors the
> status). Neither call needs auth, and both are excluded from throttling — safe
> to poll frequently.
