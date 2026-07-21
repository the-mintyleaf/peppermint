# `Signature` — a global signatory referenced by certificates

**Endpoint base:** `/api/v1/signatures/` (top-level, **not** nested under an
applicant).
**Access:** **admin/superadmin only — staff receive a non-disclosing `404`.**
**Owns:** a reusable signatory (name + private signature image) that certificate
documents reference by id. `DELETE` **deactivates** (never removes) so historical
revisions/prints keep resolving the signatory.

## 1. Fields (rows)

| Field             | TS type          | In req | In res | Req | Nullable | Server-set | Enum | Validation | Notes                                       |
| ----------------- | ---------------- | ------ | ------ | --- | -------- | ---------- | ---- | ---------- | ------------------------------------------- |
| `id`              | `string`         | ✗      | ✓      | —   | No       | ✓          | —    | UUID       | Referenced as `instructor_id`/`director_id` |
| `name`            | `string`         | ✓      | ✓      | ✓   | No       | ✗          | —    | required   |                                             |
| `title`           | `string \| null` | ✓      | ✓      | ✗   | No       | ✗          | —    | —          |                                             |
| `organization`    | `string \| null` | ✓      | ✓      | ✗   | No       | ✗          | —    | —          |                                             |
| `email`           | `string \| null` | ✓      | ✓      | ✗   | No       | ✗          | —    | email      |                                             |
| `phone`           | `string \| null` | ✓      | ✓      | ✗   | No       | ✗          | —    | —          |                                             |
| `is_active`       | `boolean`        | ✓      | ✓      | ✗   | No       | ✗          | —    | —          | `DELETE` sets this `false`                  |
| `valid_from`      | `string \| null` | ✓      | ✓      | ✗   | Yes      | ✗          | —    | date       |                                             |
| `valid_to`        | `string \| null` | ✓      | ✓      | ✗   | Yes      | ✗          | —    | date       |                                             |
| `signature_image` | `File`           | ✓      | ✗      | ✗   | —        | ✗          | —    | image only | Multipart upload; never echoed as data      |
| `has_image`       | `boolean`        | ✗      | ✓      | —   | No       | ✓          | —    | —          | Whether an image is set                     |
| `image_checksum`  | `string \| null` | ✗      | ✓      | —   | Yes      | ✓          | —    | sha-256    |                                             |
| `created_at`      | `string`         | ✗      | ✓      | —   | No       | ✓          | —    | ISO 8601   |                                             |
| `updated_at`      | `string`         | ✗      | ✓      | —   | No       | ✓          | —    | ISO 8601   |                                             |

## 2. Types

```ts
// Optional text fields are Nullable=No → "" when unset (never null);
// valid_from/valid_to and image_checksum are DB-nullable. See overview.md.
interface Signature {
  id: string;
  name: string;
  title: string;
  organization: string;
  email: string;
  phone: string;
  is_active: boolean;
  valid_from: string | null; // Nullable=Yes
  valid_to: string | null; // Nullable=Yes
  has_image: boolean;
  image_checksum: string | null; // Nullable=Yes
  created_at: string;
  updated_at: string;
}

// Create/update are sent as multipart/form-data (signature_image is a File).
// Model the field values; build the FormData at the api layer.
interface SignatureCreate {
  name: string;
  title?: string;
  organization?: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
  valid_from?: string;
  valid_to?: string;
  signature_image?: File;
}
type SignatureUpdate = Partial<SignatureCreate>; // no record_version on signatures
```

## 3. Endpoints

### `GET /api/v1/signatures/`

- **Returns:** `list[Signature]`.
- **Query params:** `?active=true` to filter to active signatories.
- **Policy key:** `applicant.signature.list`

### `POST /api/v1/signatures/`

- **Request:** **multipart** `SignatureCreate`.
- **Returns:** the created `Signature`.
- **Policy key:** `applicant.signature.create`

### `GET /api/v1/signatures/<signature_id>/`

- **Returns:** the `Signature`.
- **Policy key:** `applicant.signature.read`

### `PATCH /api/v1/signatures/<signature_id>/`

- **Request:** **multipart** `SignatureUpdate`; may replace `signature_image`.
- **Policy key:** `applicant.signature.update`

### `DELETE /api/v1/signatures/<signature_id>/`

- **Purpose:** **deactivate** (`is_active=false`), retained for history — not a
  physical delete.
- **Policy key:** `applicant.signature.delete`

### `GET /api/v1/signatures/<signature_id>/image/`

- **Returns:** the image **bytes** streamed from private storage (`inline`), not
  JSON. No public URL.
- **Policy key:** `applicant.signature.read_image`

## 4. Validations & business rules

- `name` required. `signature_image` must be a valid image (content-sniffed).
- The image is **private** — served only through the authenticated `.../image/`
  endpoint; there is no permanent public link.
- A certificate document referencing a signatory requires it to be **active and
  non-archived** at create/update time (rejected with `APPLICANT_SIGNATURE_INVALID`
  on the document, see `document.md`).

## 5. Errors

| Code                            | HTTP | Trigger                                          | Suggested UI handling                |
| ------------------------------- | ---- | ------------------------------------------------ | ------------------------------------ |
| `APPLICANT_SIGNATURE_NOT_FOUND` | 404  | unknown signature, **or staff** (non-disclosing) | not-found; for staff means no access |

## 6. Examples

```jsonc
// POST /api/v1/signatures/ — multipart/form-data fields (signature_image is a file part)
// name=Dr. Sita Rai
// title=Director
// organization=Peppermint Consultancy
// is_active=true
// signature_image=<binary>

// 201 — response.data
{
  "id": "sg09…",
  "name": "Dr. Sita Rai",
  "title": "Director",
  "organization": "Peppermint Consultancy",
  "email": "",
  "phone": "",
  "is_active": true,
  "valid_from": null,
  "valid_to": null,
  "has_image": true,
  "image_checksum": "9f86d081…",
  "created_at": "2026-07-19T06:00:00Z",
  "updated_at": "2026-07-19T06:00:00Z",
}
```

## 7. UI / integration notes

- **Concurrency:** N/A — no `record_version` on signatures.
- **Role projection:** uniform for admin; staff see nothing (404).
- **Media:** load the image via the authenticated `.../image/` stream, not a bare
  `<img>` to a CDN. Use `has_image` to decide whether to fetch.
- **Server-computed (never send):** `id`, `has_image`, `image_checksum`,
  timestamps.
- **Deactivate, not delete:** a "delete" control should read as **deactivate**;
  filter pickers with `?active=true`, but keep resolving inactive signatories on
  historical documents.
