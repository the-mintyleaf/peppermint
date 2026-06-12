# Mint Consultancy Admin Panel

Student and document management portal for educational consultancies. Handles student profiles, document creation, storage, and lifecycle management.

## Architecture

Built on the Zetsel monorepo stack. Inherits all patterns from the root `CLAUDE.md` — read that first for naming conventions, component structure, and stack rules.

## Core Features

- **Student Management** — Profile creation, enrollment tracking, status updates
- **Document Management** — Upload, organize, and version control student documents
- **Document Creation** — In-app templates and forms for generating compliance documents
- **Storage & Lifecycle** — Centralized document storage with expiry and archival workflows
- **Consultancy Dashboard** — Overview of students, pending tasks, document requests

## Module Structure

```
modules/
├── students/               # Student CRUD and list views
├── documents/              # Document creation, upload, and storage
├── dashboard/              # Consultancy overview and metrics
└── settings/               # App configuration (if needed)
```

## Key Patterns

**Student Module** — Always fetch student lists via React Query, never in useEffect. Mutations (create, update, enroll) use `useMutation`. Store student search/filter state in Zustand.

**Document Module** — File uploads go through a dedicated hook or mutation. Document status (draft, submitted, archived) drives UI conditionally. Use Mantine notifications for upload feedback.

**Query Keys** — Colocate with query functions. Example: `studentQueryKeys.list()`, `documentQueryKeys.byStudent(studentId)`.

**Forms** — Use `@mantine/form` via `@zetsel/ui`. Validation with `zod` schemas.

**Icons** — Phosphor only (e.g., `<StudentIcon aria-label="student" />`, `<FileIcon aria-label="document" />`).

## Git Commit Format

Follows parent repo:

```
[mint-consultancy/<feature>] <type>: <description>
```

Types: `add`, `fix`, `update`, `remove`, `docs`

Examples:
- `[mint-consultancy/students] add: student profile card component`
- `[mint-consultancy/documents] fix: handle large file uploads`
- `[mint-consultancy/dashboard] update: add enrollment metrics`

## Development Notes

- When a student is deleted, cascade to their documents if not archived
- Document expiry warnings should appear 14 days before deadline
- Student status can be: `active`, `on-leave`, `graduated`, `dropped`
- Document types are consultancy-defined (not hardcoded)
