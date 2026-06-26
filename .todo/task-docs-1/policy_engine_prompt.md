# Core Policy Engine Requirements

## 1. Purpose

This document defines the requirements for building a **Central Core Policy Engine** inside a Django backend project.

The policy engine is the heart of access-control metadata, endpoint tracking, permission categorization, dependency control, versioning, and changelog management.

It must be designed so that AI coding agents, backend engineers, and future applications can consistently register, update, version, audit, and reason about application endpoints and permissions.

The engine must **not** manage organization structure, departments, users, staff hierarchy, or actual permission assignments to people or departments. Those belong to separate future apps.

---

## 2. Project Placement

The Django project already has a main project folder named `core`.

The policy engine must exist inside the `core` layer because it is a foundational system component.

Recommended placement:

```text
core/
  policy_engine/
    __init__.py
    models.py
    services.py
    registry.py
    lifecycle.py
    dependency_resolver.py
    serializers.py
    admin.py
    apps.py
    management/
      commands/
        sync_policy_registry.py
        validate_policy_engine.py
```

The exact internal file structure may be adjusted if needed, but the engine must remain conceptually part of the core system and must not be mixed with organization, department, user, tenant, or assignment models.

---

## 3. Scope

The core policy engine is responsible for:

1. Registering applications/modules in the system.
2. Registering models/entities that belong to those applications.
3. Registering endpoints/API actions that belong to apps and models.
4. Categorizing endpoints into CRUD and custom permission groups.
5. Storing stable permission metadata for UI display.
6. Maintaining endpoint version history.
7. Maintaining detailed changelogs for every endpoint/model/policy metadata change.
8. Managing forward and backward permission dependencies.
9. Supporting AI-agent-driven lifecycle updates whenever code changes.
10. Providing validation tools to detect missing, broken, stale, or inconsistent policy metadata.

---

## 4. Explicit Non-Goals

The core policy engine must **not** implement the following in this phase:

1. No organization tree.
2. No department model.
3. No users or employee models.
4. No role assignment to users.
5. No department assignment.
6. No tenant ownership rules.
7. No HBAC/RBAC/ABAC assignment logic yet.
8. No final runtime authorization resolver for users yet, except optional internal metadata checks.
9. No dependency on Django's default permission table as the main source of truth.

Django's default auth and permission system may still exist in the project, but this policy engine must use its own controlled metadata tables because the system requires stronger versioning, categorization, changelog tracking, AI lifecycle compliance, and dependency management.

---

## 5. Core Design Principle

The policy engine must act like an advanced, controlled replacement for a simple content-type registry.

Django's `ContentType` model stores app/model references, but this policy engine must go further by tracking:

- apps
- models
- endpoints
- endpoint categories
- permission actions
- UI grouping metadata
- endpoint versions
- changelogs
- dependency relationships
- AI-generated change history
- lifecycle validation status

The policy engine must be the authoritative internal metadata registry for access-control definitions.

---

## 6. Main Concepts

### 6.1 Policy Application

A `PolicyApplication` represents a logical Django app or backend module.

Examples:

- `authenticate`
- `document_management`
- `case_management`
- `finance`
- `inventory`

It does **not** represent a government department, organization unit, tenant, or user group.

Required metadata:

- app key
- display name
- description
- current version
- active/deprecated status
- created timestamp
- updated timestamp

---

### 6.2 Policy Model

A `PolicyModel` represents a model/entity inside an app.

Examples:

- `UserAccount`
- `FileRecord`
- `CaseFile`
- `AuditEntry`

Required metadata:

- app reference
- model key
- model import path if applicable
- display name
- description
- current version
- active/deprecated status
- created timestamp
- updated timestamp

---

### 6.3 Policy Endpoint

A `PolicyEndpoint` represents an API endpoint, view action, service action, or backend operation that can be permission-controlled.

Examples:

- create user
- list users
- read user detail
- update user
- delete user
- ban user
- revoke password
- export report
- approve request
- archive file

Required metadata:

- app reference
- model reference, nullable for app-level endpoints
- endpoint key
- HTTP method
- route/path pattern
- view/action import path
- operation type
- display name
- description
- current version
- active/deprecated status
- internal/system-only flag
- risk level
- created timestamp
- updated timestamp

---

## 7. Endpoint Operation Categories

Every permission-controlled endpoint must be categorized into one of the following primary operation types:

1. `create`
2. `read`
3. `list`
4. `update`
5. `delete`
6. `custom`

Although CRUD is often described as Create, Read, Update, Delete, this engine must treat `read` and `list` separately because reading one object and listing many objects often require different access-control semantics.

### 7.1 Create

Used when the endpoint creates a new object or resource.

Examples:

- create user
- upload file
- create case

### 7.2 Read

Used when the endpoint reads details of one specific object.

Examples:

- read user profile
- read file details
- view case details

### 7.3 List

Used when the endpoint lists, searches, filters, or paginates multiple resources.

Examples:

- list users
- search files
- list cases

### 7.4 Update

Used when the endpoint modifies an existing object.

Examples:

- update user
- edit file metadata
- update case information

### 7.5 Delete

Used when the endpoint deletes, removes, destroys, soft-deletes, hard-deletes, or deactivates a resource.

Examples:

- delete user
- remove file
- deactivate account

### 7.6 Custom

Used for non-standard business actions that do not fit cleanly into CRUD.

Examples:

- ban user
- revoke password
- approve request
- reject request
- export report
- lock file
- unlock file
- escalate case
- assign investigator

Custom actions must still have clear display metadata, dependency metadata, and changelog metadata.

---

## 8. Permission Categorization for UI

The engine must provide human-friendly permission categorization so frontend engineers do not need to manually interpret raw endpoint metadata.

The UI must be able to load permission groups in clean sections such as:

- User Management
- Account Security
- File Management
- Case Operations
- Reporting
- Administrative Actions
- Dangerous Actions
- Custom Actions

### 8.1 Permission Category

A `PermissionCategory` groups related endpoint permissions for UI display.

Required metadata:

- category key
- display name
- description
- app reference, nullable for global categories
- model reference, nullable
- parent category, nullable
- sort order
- icon key, optional
- active/deprecated status

### 8.2 Endpoint-to-Category Mapping

Each endpoint must be mapped to one or more categories.

Required metadata:

- endpoint reference
- category reference
- display label
- help text
- sort order
- visibility flag for UI
- danger/sensitive flag

### 8.3 UI Contract

The policy engine must expose enough metadata for frontend clients to render permission controls without hardcoding endpoint names.

The UI should be able to request data shaped like:

```json
{
  "app": "authenticate",
  "groups": [
    {
      "key": "user_management",
      "label": "User Management",
      "permissions": [
        {
          "key": "authenticate.user.create",
          "label": "Create User",
          "operation": "create",
          "description": "Allows creating a new user account.",
          "risk_level": "medium",
          "dependencies": []
        },
        {
          "key": "authenticate.user.delete",
          "label": "Delete User",
          "operation": "delete",
          "description": "Allows deleting or deactivating a user account.",
          "risk_level": "high",
          "dependencies": ["authenticate.user.read", "authenticate.user.list"]
        }
      ]
    }
  ]
}
```

---

## 9. Version Control Requirements

The policy engine must maintain version control for registered apps, models, and endpoints.

A version is required because endpoints and models will evolve over time, especially when AI agents modify code.

### 9.1 Version Format

Use semantic versioning where possible:

```text
MAJOR.MINOR.PATCH
```

Examples:

```text
1.0.0
1.1.0
1.1.1
2.0.0
```

### 9.2 Version Meaning

- `PATCH`: bug fix, small correction, no permission behavior change.
- `MINOR`: backward-compatible behavior or metadata addition.
- `MAJOR`: breaking change, route change, permission behavior change, dependency change, or removed behavior.

### 9.3 Endpoint Version

Each endpoint must have a current version and historical versions.

A policy assigned to version `1.0.0` must remain understandable even after the endpoint becomes `1.1.0` or `2.0.0`.

### 9.4 Immutability Rule

Historical version records must not be overwritten.

When an endpoint changes, create a new version record and mark the previous one as superseded, deprecated, or inactive as appropriate.

---

## 10. Changelog Requirements

Version numbers alone are not enough. The engine must store detailed changelogs explaining what changed, why it changed, and how it affects access control.

### 10.1 Changelog Purpose

The changelog exists to prevent long-term confusion, AI hallucination, and loss of historical context.

When an AI coding agent or backend engineer updates an endpoint, model, permission category, or dependency rule, the changelog must capture the exact reason and effect.

### 10.2 Changelog Record

A `PolicyChangeLog` must store:

- changed object type
- changed object ID/reference
- app reference
- model reference, nullable
- endpoint reference, nullable
- previous version
- new version
- change type
- summary
- detailed description
- reason for change
- bug reference or issue reference, optional
- migration reference, optional
- affected dependencies
- affected UI categories
- backward compatibility notes
- forward compatibility notes
- created by human/AI/system
- created by identifier/name
- created timestamp

### 10.3 Change Types

Supported change types should include:

- `created`
- `updated`
- `bug_fix`
- `security_fix`
- `route_changed`
- `method_changed`
- `dependency_added`
- `dependency_removed`
- `category_changed`
- `deprecated`
- `removed`
- `restored`
- `breaking_change`
- `metadata_update`

### 10.4 Changelog Requirement for AI

Every AI-generated endpoint or endpoint update must create or update a changelog entry.

No AI-created endpoint should exist without:

1. endpoint registry entry
2. operation category
3. permission category mapping
4. dependency validation
5. version record
6. changelog record

---

## 11. Dependency Management

The policy engine must support both forward and backward permission dependencies.

Dependencies are required because some permissions logically require other permissions.

Example:

If a user can delete a file, the user usually also needs to list or read the file. Deleting without reading or listing would create an incomplete and confusing permission set.

---

## 12. Forward Dependency

A forward dependency defines what must also be granted when a permission is granted.

Example:

```text
Grant: file.delete
Requires: file.read, file.list
```

When `file.delete` is granted later by a future assignment app, the system should know that `file.read` and/or `file.list` are required.

The core engine only stores this dependency metadata. It does not assign it to users yet.

---

## 13. Backward Dependency

A backward dependency defines what must be revoked or invalidated when a prerequisite permission is removed.

Example:

```text
Revoke: file.read
Impacts: file.delete, file.update
```

If `file.read` is removed, then permissions depending on `file.read` must be reviewed, revoked, or marked invalid by the future assignment app.

The core engine must store enough metadata so future permission-assignment logic can safely cascade or warn about changes.

---

## 14. Dependency Table

A `PolicyDependency` table must define dependency relationships between endpoint permissions.

Required metadata:

- source endpoint
- target endpoint
- dependency direction
- dependency type
- enforcement mode
- reason
- active/deprecated status
- created timestamp
- updated timestamp

### 14.1 Dependency Direction

Supported directions:

- `forward`
- `backward`
- `bidirectional`

### 14.2 Dependency Type

Supported dependency types:

- `requires`
- `implies`
- `conflicts_with`
- `revokes_with`
- `suggests`

### 14.3 Enforcement Mode

Supported enforcement modes:

- `strict`: must be enforced automatically.
- `warning`: warn the admin/developer but do not force.
- `manual_review`: require review before applying.
- `metadata_only`: stored only for reasoning/documentation.

### 14.4 Dependency Examples

```text
user.delete requires user.read
user.delete requires user.list
user.update requires user.read
user.ban requires user.read
user.revoke_password requires user.read
file.delete requires file.read
file.delete requires file.list
report.export requires report.read
```

---

## 15. Recommended Django Models

The implementation may adjust field names, but the following conceptual models are required.

### 15.1 PolicyApplication

```python
class PolicyApplication(models.Model):
    key = models.SlugField(unique=True)
    display_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    current_version = models.CharField(max_length=50, default="1.0.0")
    is_active = models.BooleanField(default=True)
    is_deprecated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### 15.2 PolicyModel

```python
class PolicyModel(models.Model):
    application = models.ForeignKey(PolicyApplication, on_delete=models.CASCADE)
    key = models.SlugField()
    import_path = models.CharField(max_length=500, blank=True)
    display_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    current_version = models.CharField(max_length=50, default="1.0.0")
    is_active = models.BooleanField(default=True)
    is_deprecated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("application", "key")
```

### 15.3 PolicyEndpoint

```python
class PolicyEndpoint(models.Model):
    OPERATION_CREATE = "create"
    OPERATION_READ = "read"
    OPERATION_LIST = "list"
    OPERATION_UPDATE = "update"
    OPERATION_DELETE = "delete"
    OPERATION_CUSTOM = "custom"

    OPERATION_CHOICES = [
        (OPERATION_CREATE, "Create"),
        (OPERATION_READ, "Read"),
        (OPERATION_LIST, "List"),
        (OPERATION_UPDATE, "Update"),
        (OPERATION_DELETE, "Delete"),
        (OPERATION_CUSTOM, "Custom"),
    ]

    application = models.ForeignKey(PolicyApplication, on_delete=models.CASCADE)
    policy_model = models.ForeignKey(
        PolicyModel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    key = models.SlugField()
    permission_key = models.CharField(max_length=255, unique=True)
    http_method = models.CharField(max_length=20, blank=True)
    route_pattern = models.CharField(max_length=500, blank=True)
    view_import_path = models.CharField(max_length=500, blank=True)
    operation_type = models.CharField(max_length=50, choices=OPERATION_CHOICES)
    display_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    current_version = models.CharField(max_length=50, default="1.0.0")
    risk_level = models.CharField(max_length=50, default="low")
    is_internal = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_deprecated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("application", "key")
```

### 15.4 PermissionCategory

```python
class PermissionCategory(models.Model):
    application = models.ForeignKey(
        PolicyApplication,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    policy_model = models.ForeignKey(
        PolicyModel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    parent = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    key = models.SlugField()
    display_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    icon_key = models.CharField(max_length=100, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_deprecated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### 15.5 EndpointCategoryMap

```python
class EndpointCategoryMap(models.Model):
    endpoint = models.ForeignKey(PolicyEndpoint, on_delete=models.CASCADE)
    category = models.ForeignKey(PermissionCategory, on_delete=models.CASCADE)
    display_label = models.CharField(max_length=255)
    help_text = models.TextField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_visible_in_ui = models.BooleanField(default=True)
    is_sensitive = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("endpoint", "category")
```

### 15.6 PolicyEndpointVersion

```python
class PolicyEndpointVersion(models.Model):
    endpoint = models.ForeignKey(PolicyEndpoint, on_delete=models.CASCADE)
    version = models.CharField(max_length=50)
    route_pattern = models.CharField(max_length=500, blank=True)
    http_method = models.CharField(max_length=20, blank=True)
    view_import_path = models.CharField(max_length=500, blank=True)
    operation_type = models.CharField(max_length=50)
    snapshot = models.JSONField(default=dict, blank=True)
    is_current = models.BooleanField(default=False)
    is_deprecated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("endpoint", "version")
```

### 15.7 PolicyDependency

```python
class PolicyDependency(models.Model):
    DIRECTION_FORWARD = "forward"
    DIRECTION_BACKWARD = "backward"
    DIRECTION_BIDIRECTIONAL = "bidirectional"

    TYPE_REQUIRES = "requires"
    TYPE_IMPLIES = "implies"
    TYPE_CONFLICTS_WITH = "conflicts_with"
    TYPE_REVOKES_WITH = "revokes_with"
    TYPE_SUGGESTS = "suggests"

    ENFORCEMENT_STRICT = "strict"
    ENFORCEMENT_WARNING = "warning"
    ENFORCEMENT_MANUAL_REVIEW = "manual_review"
    ENFORCEMENT_METADATA_ONLY = "metadata_only"

    source_endpoint = models.ForeignKey(
        PolicyEndpoint,
        on_delete=models.CASCADE,
        related_name="outgoing_dependencies",
    )
    target_endpoint = models.ForeignKey(
        PolicyEndpoint,
        on_delete=models.CASCADE,
        related_name="incoming_dependencies",
    )
    direction = models.CharField(max_length=50)
    dependency_type = models.CharField(max_length=50)
    enforcement_mode = models.CharField(max_length=50, default=ENFORCEMENT_STRICT)
    reason = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    is_deprecated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (
            "source_endpoint",
            "target_endpoint",
            "direction",
            "dependency_type",
        )
```

### 15.8 PolicyChangeLog

```python
class PolicyChangeLog(models.Model):
    OBJECT_APPLICATION = "application"
    OBJECT_MODEL = "model"
    OBJECT_ENDPOINT = "endpoint"
    OBJECT_CATEGORY = "category"
    OBJECT_DEPENDENCY = "dependency"

    CREATED_BY_HUMAN = "human"
    CREATED_BY_AI = "ai"
    CREATED_BY_SYSTEM = "system"

    application = models.ForeignKey(
        PolicyApplication,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    policy_model = models.ForeignKey(
        PolicyModel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    endpoint = models.ForeignKey(
        PolicyEndpoint,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    object_type = models.CharField(max_length=50)
    object_key = models.CharField(max_length=255, blank=True)
    previous_version = models.CharField(max_length=50, blank=True)
    new_version = models.CharField(max_length=50, blank=True)
    change_type = models.CharField(max_length=100)
    summary = models.CharField(max_length=500)
    detail = models.TextField(blank=True)
    reason = models.TextField(blank=True)
    issue_reference = models.CharField(max_length=255, blank=True)
    migration_reference = models.CharField(max_length=255, blank=True)
    affected_dependencies = models.JSONField(default=list, blank=True)
    affected_categories = models.JSONField(default=list, blank=True)
    backward_compatibility_notes = models.TextField(blank=True)
    forward_compatibility_notes = models.TextField(blank=True)
    created_by_type = models.CharField(max_length=50, default=CREATED_BY_SYSTEM)
    created_by_identifier = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

---

## 16. Permission Key Naming Standard

Each endpoint must have a stable `permission_key`.

Recommended format:

```text
<app_key>.<model_key_or_scope>.<operation_or_action>
```

Examples:

```text
authenticate.user.create
authenticate.user.list
authenticate.user.read
authenticate.user.update
authenticate.user.delete
authenticate.user.ban
authenticate.user.revoke_password
document.file.create
document.file.read
document.file.delete
```

Rules:

1. Permission keys must be lowercase.
2. Use snake_case for multi-word actions.
3. Do not rename keys casually.
4. If a permission key must be renamed, create a changelog and version record.
5. Deprecated permission keys must remain traceable.
6. UI labels can change, but permission keys should remain stable whenever possible.

---

## 17. Policy Engine Lifecycle

The policy engine lifecycle is mandatory for every AI-generated or human-generated endpoint change.

Whenever a new endpoint, model, route, action, or permission-sensitive behavior is created, updated, deleted, or deprecated, the lifecycle must be followed.

### 17.1 Lifecycle Steps

1. Identify the app/module affected.
2. Identify the model/entity affected, if any.
3. Identify whether the endpoint is create, read, list, update, delete, or custom.
4. Create or update the `PolicyApplication` record.
5. Create or update the `PolicyModel` record if the endpoint belongs to a model/entity.
6. Create or update the `PolicyEndpoint` record.
7. Assign or update the human-friendly permission category.
8. Define dependency relationships.
9. Update forward dependencies.
10. Update backward dependencies.
11. Create a new endpoint version record if behavior or metadata changed.
12. Create a changelog entry explaining what changed and why.
13. Validate the policy registry.
14. Confirm no endpoint exists without policy metadata.
15. Confirm no dangerous endpoint exists without category, dependency, version, and changelog records.

---

## 18. AI Coding Agent SOP

This section must be added to `CLAUDE.md`, `CLOUD.md`, or whichever instruction file is used by the AI coding agent.

### 18.1 Mandatory Agent Rule

The AI coding agent must treat policy engine updates as part of endpoint development.

Creating or changing an endpoint is not complete until the policy engine metadata is also created or updated.

### 18.2 Agent Must Do This Every Time

Whenever the AI creates, modifies, renames, removes, deprecates, or fixes an endpoint, it must:

1. Register or update the endpoint in the policy engine.
2. Assign the correct operation type: create, read, list, update, delete, or custom.
3. Assign a UI-friendly permission category.
4. Create or update dependency relationships.
5. Create or update forward dependency rules.
6. Create or update backward dependency rules.
7. Increment endpoint version when required.
8. Add a detailed changelog entry.
9. Record whether the change was generated by AI.
10. Run policy validation before considering the task complete.

### 18.3 Agent Must Not Do This

The AI coding agent must not:

1. Use Django's default permission table as the primary access-control metadata system.
2. Create endpoint code without policy metadata.
3. Create custom actions without category mapping.
4. Create delete/update/ban/revoke-style permissions without dependency review.
5. Modify route patterns without version and changelog updates.
6. Delete old version records.
7. Overwrite historical changelogs.
8. Put organization, department, or user-assignment logic inside the core policy engine.

---

## 19. Required Validation Rules

The engine must provide validation utilities that can detect:

1. Endpoints missing from the policy registry.
2. Registry endpoints that no longer exist in code.
3. Endpoints without operation category.
4. Endpoints without UI category.
5. Dangerous endpoints without dependencies.
6. Changed endpoints without version update.
7. Changed endpoints without changelog entry.
8. Duplicate permission keys.
9. Broken dependency references.
10. Circular dependencies where not allowed.
11. Deprecated endpoints still marked as active.
12. Missing model/app metadata.

Recommended management command:

```bash
python manage.py validate_policy_engine
```

Expected result:

```text
Policy Engine Validation Passed
```

or detailed errors such as:

```text
ERROR: Endpoint authenticate.user.delete has no dependency metadata.
ERROR: Endpoint document.file.export changed route but has no changelog.
ERROR: Permission key authenticate.user.read is duplicated.
```

---

## 20. Registry Sync Requirement

The engine should provide a command to sync declared endpoint metadata into the database.

Recommended command:

```bash
python manage.py sync_policy_registry
```

This command should be idempotent.

Running it multiple times should not create duplicates.

It should:

1. create missing app records
2. create missing model records
3. create missing endpoint records
4. update changed endpoint metadata
5. create version records when changes are detected
6. create changelog entries when changes are detected
7. create or update category mappings
8. create or update dependency mappings
9. warn about stale registry records

---

## 21. Recommended Registry Declaration Pattern

To make AI-agent updates reliable, endpoint policy metadata may be declared in code near the endpoint or in a central registry file.

Example declaration:

```python
POLICY_ENDPOINTS = [
    {
        "app_key": "authenticate",
        "model_key": "user",
        "endpoint_key": "user_delete",
        "permission_key": "authenticate.user.delete",
        "http_method": "DELETE",
        "route_pattern": "/api/auth/users/<id>/",
        "view_import_path": "authenticate.views.UserDeleteView",
        "operation_type": "delete",
        "display_name": "Delete User",
        "description": "Allows deleting or deactivating a user account.",
        "risk_level": "high",
        "category_key": "user_management",
        "category_display_name": "User Management",
        "dependencies": [
            {
                "target_permission_key": "authenticate.user.read",
                "direction": "forward",
                "dependency_type": "requires",
                "enforcement_mode": "strict",
                "reason": "A user must be readable before delete access is meaningful."
            },
            {
                "target_permission_key": "authenticate.user.list",
                "direction": "forward",
                "dependency_type": "requires",
                "enforcement_mode": "warning",
                "reason": "Listing is usually needed to discover users before deletion."
            }
        ],
        "version": "1.0.0",
        "change_summary": "Initial registration of user deletion endpoint.",
        "change_reason": "Endpoint created by AI coding lifecycle."
    }
]
```

The final implementation may use decorators, registry files, serializers, or management commands, but the metadata must be complete and validated.

---

## 22. Risk Levels

Every endpoint should have a risk level.

Recommended values:

- `low`
- `medium`
- `high`
- `critical`

Examples:

```text
read profile: low
list users: medium
update user: medium/high
delete user: high
ban user: high
revoke password: high
export sensitive report: critical
```

High-risk and critical endpoints must have explicit dependency review and changelog records.

---

## 23. Future Compatibility

This core policy engine should be designed so that future apps can use it without rewriting it.

Future apps may include:

1. Organization app
2. Department app
3. User management app
4. Role assignment app
5. RBAC app
6. ABAC app
7. HBAC app
8. Audit dashboard
9. Admin permission UI
10. AI policy recommendation system

The current engine should store clean metadata that those future apps can consume.

---

## 24. Integration Boundary With Future Permission Assignment App

The future permission app may assign permissions to users, roles, departments, groups, or hierarchy nodes.

However, the core policy engine only defines what permissions exist, what they mean, how they are categorized, how they depend on each other, and how they changed over time.

The boundary is:

```text
Core Policy Engine:
  Defines and versions permission metadata.

Future Permission Assignment App:
  Assigns permission metadata to users, roles, departments, groups, or hierarchy nodes.
```

The core engine must remain independent of assignment logic.

---

## 25. Admin Requirements

Django admin should support viewing and managing:

1. Policy applications
2. Policy models
3. Policy endpoints
4. Permission categories
5. Endpoint-category mappings
6. Endpoint versions
7. Dependencies
8. Changelogs

Admin views should be read-friendly and searchable.

Recommended admin filters:

- app
- model
- operation type
- risk level
- active/deprecated status
- version
- change type
- created by type

---

## 26. API Requirements

The engine should expose internal APIs/services for frontend or other apps.

Recommended service functions:

```python
get_registered_apps()
get_policy_models(app_key=None)
get_policy_endpoints(app_key=None, model_key=None)
get_permission_categories(app_key=None)
get_ui_permission_tree(app_key=None)
get_endpoint_dependencies(permission_key)
get_forward_dependencies(permission_key)
get_backward_dependencies(permission_key)
get_endpoint_versions(permission_key)
get_endpoint_changelog(permission_key)
validate_policy_registry()
```

These may be implemented as service functions first, then exposed through API views later if needed.

---

## 27. Security Requirements

The policy engine must protect integrity of metadata.

Rules:

1. Changelog records should be append-only.
2. Version records should not be deleted casually.
3. Permission keys should not be renamed without migration notes.
4. High-risk endpoints require explicit risk level.
5. Custom endpoints require explicit description.
6. Dependency records must be validated.
7. Stale endpoints must be marked deprecated, not silently removed.

---

## 28. Testing Requirements

Tests must cover:

1. App registration.
2. Model registration.
3. Endpoint registration.
4. CRUD operation categorization.
5. Custom endpoint categorization.
6. UI permission tree output.
7. Forward dependency creation.
8. Backward dependency creation.
9. Dependency resolution.
10. Version creation.
11. Changelog creation.
12. Validation command success.
13. Validation command failure for missing metadata.
14. Duplicate permission key prevention.
15. Deprecated endpoint handling.

---

## 29. Minimum Acceptance Criteria

The implementation is acceptable only when:

1. The policy engine exists inside the `core` system layer.
2. It has its own database models and does not rely on Django default permissions as the main metadata system.
3. It can register apps, models, endpoints, categories, dependencies, versions, and changelogs.
4. Every endpoint can be classified as create, read, list, update, delete, or custom.
5. UI-friendly permission categorization is supported.
6. Forward and backward dependencies are stored and queryable.
7. Endpoint version history is stored.
8. Detailed changelog history is stored.
9. AI-created changes are tracked as AI-created.
10. A validation command can detect incomplete policy lifecycle work.
11. A sync command can update the registry idempotently.
12. Organization, department, user, and role assignment logic are not added to this engine.

---

## 30. Required `CLAUDE.md` / `CLOUD.md` Patch

Add the following section to the AI coding agent instruction file.

```markdown
## Core Policy Engine Lifecycle

This project uses a custom Core Policy Engine inside the `core` layer.

Do not use Django's default permission system as the primary access-control metadata source.

Whenever you create, modify, rename, deprecate, delete, or fix any endpoint, view, API action, service action, or permission-sensitive backend behavior, you must update the Core Policy Engine metadata as part of the same task.

For every endpoint change, you must ensure:

1. The app/module is registered.
2. The related model/entity is registered if applicable.
3. The endpoint is registered.
4. The endpoint has a stable permission key.
5. The endpoint is categorized as create, read, list, update, delete, or custom.
6. The endpoint has a UI-friendly permission category.
7. The endpoint has risk-level metadata.
8. Forward dependencies are defined.
9. Backward dependencies are defined where needed.
10. Endpoint version is created or updated.
11. A detailed changelog entry is created.
12. The changelog explains what changed, why it changed, and whether it affects backward or forward compatibility.
13. AI-generated changes are recorded as AI-generated.
14. Policy validation is run before considering the implementation complete.

Never create or modify an endpoint without completing the policy lifecycle.

Never put organization, department, user hierarchy, role assignment, RBAC assignment, ABAC assignment, or HBAC assignment logic inside the Core Policy Engine. Those belong to separate future apps.

The Core Policy Engine only defines, versions, categorizes, documents, validates, and tracks permission metadata.
```

---

## 31. Final Implementation Guidance

Build this engine as a clean metadata foundation first.

Do not rush into user assignment logic.

The correct order is:

1. Build registry models.
2. Build version/changelog models.
3. Build dependency models.
4. Build categorization models.
5. Build services.
6. Build admin.
7. Build sync command.
8. Build validation command.
9. Add tests.
10. Only later integrate with organization/user/department/role assignment apps.

The long-term goal is to make access control traceable, scalable, AI-safe, and understandable even after years of endpoint changes.
