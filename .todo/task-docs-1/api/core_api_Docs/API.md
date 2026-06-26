# Core API Documentation

## Health Check Endpoints

### GET /health/

**Auth required:** No (public)
**Throttle class:** None
**Purpose:** Liveness check — confirms the process is running.

**Response (200 OK):**

```json
{ "status": "ok" }
```

**Business rules:** Always returns 200 while the process is alive. No DB check performed.

---

### GET /ready/

**Auth required:** No (public)
**Throttle class:** None
**Purpose:** Readiness check — confirms the service is ready to handle traffic (DB connected).

**Response (200 OK):**

```json
{ "status": "ready" }
```

**Response (503 Service Unavailable):**

```json
{ "status": "not ready" }
```

**Business rules:** Returns 503 if the database connection cannot be established.

---

## Standard Response Envelope

All API endpoints (under `/api/v1/`) use these shapes.

### Success

```json
{
  "success": true,
  "message": "...",
  "data": {},
  "meta": {}
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "...",
    "details": {}
  },
  "meta": {}
}
```

### Paginated List

```json
{
  "success": true,
  "message": "",
  "data": [],
  "meta": {
    "count": 100,
    "page": 1,
    "page_size": 20,
    "next": "https://api.example.com/api/v1/resource/?page=2",
    "previous": null
  }
}
```

## Global Error Codes

| Code                      | HTTP Status | Meaning                          |
| ------------------------- | ----------- | -------------------------------- |
| `INTERNAL_SERVER_ERROR`   | 500         | Unhandled exception              |
| `VALIDATION_ERROR`        | 400         | Request body validation failed   |
| `AUTHENTICATION_REQUIRED` | 401         | No credentials provided          |
| `AUTHENTICATION_FAILED`   | 401         | Invalid or expired credentials   |
| `PERMISSION_DENIED`       | 403         | Authenticated but not authorized |
| `NOT_FOUND`               | 404         | Resource not found               |
| `METHOD_NOT_ALLOWED`      | 405         | HTTP method not supported        |
| `RATE_LIMIT_EXCEEDED`     | 429         | Throttle limit hit               |

## Change History

| Date       | Change                                                                   | Author      |
| ---------- | ------------------------------------------------------------------------ | ----------- |
| 2026-06-18 | Initial scaffold — health check endpoints and standard response envelope | Claude Code |
