# Core Data Contracts

## Contract: BaseModel (Abstract)

**Owner app:** core
**Purpose:** Shared abstract base for all domain models. Provides UUID primary key and audit timestamps.
**Version:** 1.0
**Type:** Abstract — no database table.

### Schema

| Field        | Type                     | Required  | Notes                                                        |
| ------------ | ------------------------ | --------- | ------------------------------------------------------------ |
| `id`         | UUID                     | Generated | Primary key, auto-generated via `uuid.uuid4`, never editable |
| `created_at` | DateTimeField (TZ-aware) | Generated | Set on creation, never editable                              |
| `updated_at` | DateTimeField (TZ-aware) | Generated | Updated on every save                                        |

### Validation Rules

- `id` is non-editable and never exposed as an internal PK
- All timestamps are UTC-aware (`USE_TZ=True`)

### Usage

Extend `core.models.BaseModel` in any domain model that requires UUID PKs and audit timestamps.

```python
from core.models import BaseModel

class MyModel(BaseModel):
    name = models.CharField(max_length=255)

    def __str__(self) -> str:
        return self.name
```

### Change History

| Date       | Change             |
| ---------- | ------------------ |
| 2026-06-18 | Initial definition |

---

## Contract: Standard API Response Envelope

**Owner app:** core
**Purpose:** Unified response shape for all API endpoints. Implemented in `core/responses.py`.
**Version:** 1.0

### Success Shape

```json
{
  "success": true,
  "message": "string",
  "data": {},
  "meta": {}
}
```

### Error Shape

```json
{
  "success": false,
  "error": {
    "code": "UPPER_SNAKE_CASE",
    "message": "string",
    "details": {}
  },
  "meta": {}
}
```

### Change History

| Date       | Change             |
| ---------- | ------------------ |
| 2026-06-18 | Initial definition |
