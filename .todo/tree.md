# Organization Tree APIs

Quick reference for building org chart / tree views. All endpoints require staff or superuser auth. Base prefix: `/api/v1/organization/`.

---

## 1. Flat tree nodes — primary endpoint

```
GET /organizations/<org_id>/unit-tree-nodes/
```

Returns all units as a **flat array** with `parent_id` references and a `has_children` flag. Designed for tree libraries that work with flat + parent_id (D3 `stratify()`, React Flow, Ant Design Tree). Client assembles the tree in a single forward pass — parents always come before children in the response.

### Query params

| Param | Type | Default | Description |
|---|---|---|---|
| `status` | string | all | Filter by unit status: `draft`, `active`, `inactive`, `merged`, `split`, `renamed`, `archived` |
| `root_unit_id` | UUID | org-wide | Scope to a subtree — returns that unit and all descendants |
| `max_depth` | integer ≥ 0 | unlimited | Return only units at absolute depth ≤ N (0 = roots only, 1 = roots + direct children) |
| `include_members` | boolean | `false` | When `true`, each node gets a `positions` array with active holders |

All four params compose freely. `root_unit_id` + `max_depth` together scope to a subtree within N hops of the root unit.

---

### Response — units only (no `include_members`)

```
GET /organizations/550e8400-e29b-41d4-a716-446655440000/unit-tree-nodes/?status=active&max_depth=2
```

```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "id": "aaa00000-0000-0000-0000-000000000001",
      "parent_id": null,
      "name_np": "स्वास्थ्य मन्त्रालय",
      "name_en": "Ministry of Health",
      "code": "moh",
      "unit_type": "root",
      "status": "active",
      "depth": 0,
      "sort_order": 0,
      "path_cache": "moh",
      "is_operational": true,
      "is_active": true,
      "has_children": true
    },
    {
      "id": "bbb00000-0000-0000-0000-000000000002",
      "parent_id": "aaa00000-0000-0000-0000-000000000001",
      "name_np": "स्वास्थ्य निर्देशनालय",
      "name_en": "Health Directorate",
      "code": "health-directorate",
      "unit_type": "department",
      "status": "active",
      "depth": 1,
      "sort_order": 0,
      "path_cache": "moh/health-directorate",
      "is_operational": true,
      "is_active": true,
      "has_children": true
    },
    {
      "id": "ccc00000-0000-0000-0000-000000000003",
      "parent_id": "bbb00000-0000-0000-0000-000000000002",
      "name_np": "औषधि व्यवस्थापन शाखा",
      "name_en": "Drug Management Branch",
      "code": "drug-mgmt",
      "unit_type": "branch",
      "status": "active",
      "depth": 2,
      "sort_order": 0,
      "path_cache": "moh/health-directorate/drug-mgmt",
      "is_operational": true,
      "is_active": true,
      "has_children": false
    }
  ],
  "meta": {
    "total_nodes": 3,
    "max_depth": 2,
    "scoped_to_unit": null,
    "depth_limit": 2
  }
}
```

**Meta fields:**

| Field | Description |
|---|---|
| `total_nodes` | Number of nodes returned |
| `max_depth` | Deepest absolute `depth` among returned nodes |
| `scoped_to_unit` | The `root_unit_id` param value if set, else `null` |
| `depth_limit` | The `max_depth` param value if set, else `null` |

---

### Response — with members (`include_members=true`)

```
GET /organizations/550e8400-e29b-41d4-a716-446655440000/unit-tree-nodes/?include_members=true
```

Each node gains a `positions` array. Active positions with no current holders show `holders: []`. When `include_members` is absent or `false`, the `positions` key is omitted entirely.

```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "id": "aaa00000-0000-0000-0000-000000000001",
      "parent_id": null,
      "name_np": "स्वास्थ्य मन्त्रालय",
      "name_en": "Ministry of Health",
      "code": "moh",
      "unit_type": "root",
      "status": "active",
      "depth": 0,
      "sort_order": 0,
      "path_cache": "moh",
      "is_operational": true,
      "is_active": true,
      "has_children": true,
      "positions": [
        {
          "id": "pos-uuid-0001",
          "title_np": "मन्त्री",
          "title_en": "Minister",
          "code": "moh-minister",
          "position_type": "executive",
          "is_leadership": true,
          "is_supervisory": true,
          "status": "active",
          "holders": [
            {
              "assignment_id": "assign-uuid-0001",
              "user_id": "user-uuid-0001",
              "username": "jane.smith",
              "display_name": "Jane Smith",
              "assignment_type": "primary",
              "is_primary": true
            }
          ]
        },
        {
          "id": "pos-uuid-0002",
          "title_np": "उपमन्त्री",
          "title_en": "Deputy Minister",
          "code": "moh-deputy",
          "position_type": "deputy_head",
          "is_leadership": true,
          "is_supervisory": false,
          "status": "active",
          "holders": []
        }
      ]
    },
    {
      "id": "bbb00000-0000-0000-0000-000000000002",
      "parent_id": "aaa00000-0000-0000-0000-000000000001",
      "name_np": "स्वास्थ्य निर्देशनालय",
      "name_en": "Health Directorate",
      "code": "health-directorate",
      "unit_type": "department",
      "status": "active",
      "depth": 1,
      "sort_order": 0,
      "path_cache": "moh/health-directorate",
      "is_operational": true,
      "is_active": true,
      "has_children": false,
      "positions": []
    }
  ],
  "meta": {
    "total_nodes": 2,
    "max_depth": 1,
    "scoped_to_unit": null,
    "depth_limit": null
  }
}
```

---

### Error responses

| Code | HTTP | Condition |
|---|---|---|
| `ORGANIZATION_NOT_FOUND` | 404 | `org_id` not found |
| `ORGANIZATION_UNIT_NOT_FOUND` | 404/400 | `root_unit_id` not found in this org, or malformed UUID |
| `ORGANIZATION_UNIT_INVALID_STATUS` | 400 | `status` param is not a valid `UnitStatus` value |
| `ORGANIZATION_UNIT_INVALID_DEPTH` | 400 | `max_depth` is not a non-negative integer |

```json
{
  "success": false,
  "error": {
    "code": "ORGANIZATION_NOT_FOUND",
    "message": "Organization not found.",
    "details": {}
  },
  "meta": {}
}
```

---

### Query cost

| Scenario | Queries |
|---|---|
| No params, no members | 1 |
| With `root_unit_id` or `max_depth`, no members | up to 3 |
| With `include_members=true` | up to 5 |

No N+1 regardless of org size.

---

## 2. Nested tree — alternative

```
GET /organizations/<org_id>/unit-tree/
```

Returns the same data as §1 but as a **nested JSON tree** (children inline). One query, assembled in-memory. Better suited for small orgs or when you want the server to build the structure.

```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "id": "aaa00000-0000-0000-0000-000000000001",
      "parent_id": null,
      "name_np": "स्वास्थ्य मन्त्रालय",
      "code": "moh",
      "unit_type": "root",
      "status": "active",
      "sort_order": 0,
      "children": [
        {
          "id": "bbb00000-0000-0000-0000-000000000002",
          "parent_id": "aaa00000-0000-0000-0000-000000000001",
          "name_np": "स्वास्थ्य निर्देशनालय",
          "code": "health-directorate",
          "unit_type": "department",
          "status": "active",
          "sort_order": 0,
          "children": []
        }
      ]
    }
  ],
  "meta": {}
}
```

No filtering or member-enrichment params — use §1 when you need those.

---

## 3. Subtree scope + lazy expand pattern

To lazy-load a branch when the user expands a node:

```
GET /organizations/<org_id>/unit-tree-nodes/?root_unit_id=<node_id>&max_depth=1
```

`has_children` on boundary nodes is always accurate — even when `max_depth` cuts the tree — so the frontend knows whether to show an expand arrow without fetching deeper.

```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "id": "bbb00000-0000-0000-0000-000000000002",
      "parent_id": "aaa00000-0000-0000-0000-000000000001",
      "name_np": "स्वास्थ्य निर्देशनालय",
      "name_en": "Health Directorate",
      "code": "health-directorate",
      "unit_type": "department",
      "status": "active",
      "depth": 1,
      "sort_order": 0,
      "path_cache": "moh/health-directorate",
      "is_operational": true,
      "is_active": true,
      "has_children": true
    },
    {
      "id": "ccc00000-0000-0000-0000-000000000003",
      "parent_id": "bbb00000-0000-0000-0000-000000000002",
      "name_np": "औषधि व्यवस्थापन शाखा",
      "name_en": "Drug Management Branch",
      "code": "drug-mgmt",
      "unit_type": "branch",
      "status": "active",
      "depth": 2,
      "sort_order": 0,
      "path_cache": "moh/health-directorate/drug-mgmt",
      "is_operational": true,
      "is_active": true,
      "has_children": false
    }
  ],
  "meta": {
    "total_nodes": 2,
    "max_depth": 2,
    "scoped_to_unit": "bbb00000-0000-0000-0000-000000000002",
    "depth_limit": 1
  }
}
```

---

## 4. Ancestors (breadcrumb)

```
GET /units/<unit_id>/ancestors/
```

Returns the path from root to the given unit, root-first. Used for breadcrumb navigation when the user drills into a node.

```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "id": "aaa00000-0000-0000-0000-000000000001",
      "name_np": "स्वास्थ्य मन्त्रालय",
      "name_en": "Ministry of Health",
      "code": "moh",
      "unit_type": "root",
      "depth": 0
    },
    {
      "id": "bbb00000-0000-0000-0000-000000000002",
      "name_np": "स्वास्थ्य निर्देशनालय",
      "name_en": "Health Directorate",
      "code": "health-directorate",
      "unit_type": "department",
      "depth": 1
    }
  ],
  "meta": {}
}
```

Uses the closure table — O(1), no recursive traversal.

---

## 5. Descendants

```
GET /units/<unit_id>/descendants/
```

Returns all units below the given unit (self excluded). Uses the closure table.

```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "id": "ccc00000-0000-0000-0000-000000000003",
      "name_np": "औषधि व्यवस्थापन शाखा",
      "name_en": "Drug Management Branch",
      "code": "drug-mgmt",
      "unit_type": "branch",
      "depth": 2
    }
  ],
  "meta": {}
}
```

---

## 6. Position holders

```
GET /positions/<position_id>/holders/
```

Returns active `PositionAssignment` rows for one position. Used to show who is in a specific role when the user clicks a position node.

```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "id": "assign-uuid-0001",
      "position_id": "pos-uuid-0001",
      "user_id": "user-uuid-0001",
      "username": "jane.smith",
      "display_name": "Jane Smith",
      "assignment_type": "primary",
      "is_primary": true,
      "status": "active",
      "starts_at": "2025-04-14T05:45:00+05:45",
      "ends_at": null
    }
  ],
  "meta": {}
}
```

---

## 7. Chain of command

```
GET /positions/<position_id>/chain-of-command/?reporting_line_type=administrative
```

Walks `ReportingLine.target_position` upward from a position. Returns the reporting chain ordered from the given position up to the root. Used to show "who does this person report to."

`reporting_line_type` options: `administrative` (default), `functional`.

```json
{
  "success": true,
  "message": "",
  "data": [
    { "position_id": "pos-uuid-0003", "code": "drug-officer", "title_np": "औषधि अधिकृत", "depth": 0 },
    { "position_id": "pos-uuid-0002", "code": "health-directorate-head", "title_np": "निर्देशक", "depth": 1 },
    { "position_id": "pos-uuid-0001", "code": "moh-minister", "title_np": "मन्त्री", "depth": 2 }
  ],
  "meta": {}
}
```

---

## 8. Subordinates

```
GET /positions/<position_id>/subordinates/
```

Returns positions that report directly to the given position (direct reports). Inverse of §7.

```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "id": "pos-uuid-0003",
      "title_np": "औषधि अधिकृत",
      "title_en": "Drug Officer",
      "code": "drug-officer",
      "position_type": "officer",
      "is_leadership": false,
      "is_supervisory": false,
      "status": "active"
    }
  ],
  "meta": {}
}
```

---

## Recommended loading strategy

| Step | Call | Purpose |
|---|---|---|
| Initial render | `unit-tree-nodes/?status=active&max_depth=2` | Top 2 levels, low data |
| User expands node | `unit-tree-nodes/?root_unit_id=<id>&max_depth=1` | Lazy-load one level at a time |
| Show members inline | Add `&include_members=true` to either call | Positions + holders per node |
| Breadcrumb | `units/<id>/ancestors/` | Path from root to selected node |
| Click position | `positions/<id>/holders/` | Who currently holds it |
| Reporting chain panel | `positions/<id>/chain-of-command/` | Full upward chain |
| Direct reports panel | `positions/<id>/subordinates/` | Who reports to this position |

---

## Known gaps

- `UnitMembership` (users placed directly in a unit without a position) is **not** included in `include_members`. Only position-based assignments surface. This is a documented limitation — a future `unit_members` key may be added.
- `OrganizationSite` has no public API endpoint in the current version