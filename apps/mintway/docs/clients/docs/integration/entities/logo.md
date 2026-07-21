# `Logo` — the private branding image for a client

**Endpoint base:** nested under `/api/v1/clients/{client_id}/logo/` (original
upload/stream/remove) and `/api/v1/clients/{client_id}/logo/thumbnail/` (thumbnail
stream).
**Access:** staff and admin/superadmin — **uniform** (no role projection). Writes
(upload / remove) inherit the parent's lock/archive guard: a staff write on an
admin-**locked** client → `423`, and any write on an **archived** client → `409`.
An unknown / malformed client id → non-disclosing `404 CLIENT_NOT_FOUND`; a client
with no current logo → `404 CLIENT_LOGO_NOT_FOUND` on a stream.
**Owns:** one **current** logo per client — the original image plus a generated PNG
thumbnail — stored in **private** on-prem media with **no public URL**. Replace and
remove are **soft**: the prior row is retired (`is_current=false`, file retained)
so a logo embedded in a historical document snapshot stays resolvable. The image is
**never returned as JSON** — it is streamed bytes; the only JSON the frontend
receives is the compact **upload result** and the `logo_url` / `logo_thumbnail_url`
that ride on the client read (see `client.md`).

## 1. Fields (rows)

These are the stored `ClientLogo` fields. The frontend never receives the full row
as JSON: a **GET** streams raw image bytes (`inline`), and the **POST** returns only
the compact result subset — the rows marked `In res ✓` below (`logo_id`, `checksum`,
`mime_type`, `width`, `height`). Everything else is server-internal and never
echoed. The only writable input is the multipart `file` part.

| Field               | TS type          | In req | In res | Req | Nullable | Server-set | Enum | Validation                                   | Notes                                                          |
| ------------------- | ---------------- | ------ | ------ | --- | -------- | ---------- | ---- | -------------------------------------------- | -------------------------------------------------------------- |
| `logo_id`           | `string`         | ✗      | ✓      | —   | No       | ✓          | —    | UUID                                         | The `ClientLogo` id; returned in the upload result             |
| `file`              | `File`           | ✓      | ✗      | ✓   | No       | ✗          | —    | image only; JPEG/PNG/WebP; ≤5 MB; ≤4096×4096 | Multipart part named `file`; never echoed — streamed via GET   |
| `thumbnail`         | `File`           | ✗      | ✗      | —   | Yes      | ✓          | —    | —                                            | Generated PNG (≤256×256); streamed via `.../thumbnail/`        |
| `original_filename` | `string`         | ✗      | ✗      | —   | No       | ✗          | —    | ≤255                                         | Client-supplied name; never trusted for storage / not echoed   |
| `mime_type`         | `string`         | ✗      | ✓      | —   | No       | ✓          | —    | `image/jpeg` \| `image/png` \| `image/webp`  | Derived from content, not the extension                        |
| `size_bytes`        | `number`         | ✗      | ✗      | —   | No       | ✓          | —    | —                                            | Byte size of the original                                      |
| `width`             | `number`         | ✗      | ✓      | —   | No       | ✓          | —    | ≤4096                                        | Original pixel width                                           |
| `height`            | `number`         | ✗      | ✓      | —   | No       | ✓          | —    | ≤4096                                        | Original pixel height                                          |
| `checksum`          | `string`         | ✗      | ✓      | —   | No       | ✓          | —    | sha-256 hex                                  | Of the original bytes                                          |
| `is_current`        | `boolean`        | ✗      | ✗      | —   | No       | ✓          | —    | —                                            | Exactly one current logo per client; retired on replace/remove |
| `uploaded_by`       | `string \| null` | ✗      | ✗      | —   | Yes      | ✓          | —    | UUID                                         | Uploader (not echoed)                                          |
| `archived_at`       | `string \| null` | ✗      | ✗      | —   | Yes      | ✓          | —    | ISO 8601                                     | Set when retired/removed (not echoed)                          |
| `archived_by`       | `string \| null` | ✗      | ✗      | —   | Yes      | ✓          | —    | UUID                                         | Set when retired/removed (not echoed)                          |
| `created_at`        | `string`         | ✗      | ✗      | —   | No       | ✓          | —    | ISO 8601                                     | Not echoed                                                     |
| `updated_at`        | `string`         | ✗      | ✗      | —   | No       | ✓          | —    | ISO 8601                                     | Not echoed                                                     |

## 2. Types

```ts
// The logo image is NEVER returned as JSON on read — a GET streams raw bytes
// (Content-Disposition: inline). There is therefore NO read DTO for the logo:
// render it from the client's `logo_url` / `logo_thumbnail_url` (see client.md).

// The ONLY JSON the frontend receives from the logo endpoints is the upload result.
interface LogoUploadResult {
  logo_id: string;
  checksum: string; // sha-256 hex of the original
  mime_type: string; // image/jpeg | image/png | image/webp
  width: number;
  height: number;
}

// Upload / replace is multipart/form-data with a single `file` part.
// Model the value; build the FormData at the api layer.
interface ClientLogoUpload {
  file: File;
}
// No Update type — a re-upload (POST) replaces the current logo; DELETE removes it.
```

## 3. Endpoints

### `POST /api/v1/clients/{client_id}/logo/`

- **Purpose:** upload the client's logo, or replace an existing one.
- **Request:** **multipart/form-data** with a single `file` part (`ClientLogoUpload`).
- **Returns:** `LogoUploadResult` (`201`).
- **Side effects:** content is MIME-sniffed via Pillow (spoofed extension rejected);
  a PNG thumbnail (≤256×256) is generated; the prior current logo is **retired**
  (`is_current=false`, file retained); appends a `client_logo_uploaded` audit event.
- **Policy key:** `clients.logo.create`

### `GET /api/v1/clients/{client_id}/logo/`

- **Purpose:** display the full-resolution logo.
- **Returns:** the current logo's **image bytes** streamed `inline` with its stored
  MIME type — **not JSON**. No public URL. `404 CLIENT_LOGO_NOT_FOUND` when the
  client has no current logo.
- **Policy key:** `clients.logo.read`

### `GET /api/v1/clients/{client_id}/logo/thumbnail/`

- **Purpose:** display the compact logo (lists, avatars).
- **Returns:** the PNG **thumbnail bytes** streamed `inline` — **not JSON**.
  `404 CLIENT_LOGO_NOT_FOUND` when there is no current logo / thumbnail.
- **Policy key:** `clients.logo.read_thumbnail`

### `DELETE /api/v1/clients/{client_id}/logo/`

- **Purpose:** remove the client's logo.
- **Returns:** removal confirmation; the current logo is **soft-retired**
  (`is_current=false`, file retained per the retention rule) — never a request-time
  physical delete.
- **Side effects:** appends a `client_logo_removed` audit event.
- **Policy key:** `clients.logo.delete`

## 4. Validations & business rules

- **Image only, validated by content, not extension.** Pillow decodes and verifies
  the upload; the format must be JPEG / PNG / WebP. A spoofed extension (bytes don't
  match) → `CLIENT_LOGO_TYPE_UNSUPPORTED` (415); a file that isn't a decodable image
  → `CLIENT_LOGO_INVALID` (400).
- **Size ≤ 5 MB** → over-limit `CLIENT_LOGO_TOO_LARGE` (413).
- **Dimensions ≤ 4096×4096** → over-limit `CLIENT_LOGO_DIMENSIONS_INVALID` (400).
- **SVG is disabled** until sanitization exists — reject it as an unsupported type.
- **Replace and remove are soft** — the prior current row is retired (`is_current`
  → false) and its file is retained so historical document snapshots keep resolving;
  there is at most one current logo per client.
- **Parent guard.** Upload and remove inherit the client's lock/archive state:
  a staff write on a locked client → `423 CLIENT_RECORD_LOCKED`; any write on an
  archived client → `409 CLIENT_ARCHIVED`. Streams are unaffected by the guard.
- The client-supplied filename is **never** used to build the storage path.

## 5. Errors

| Code                             | HTTP | Trigger                                                   | Suggested UI handling                                     |
| -------------------------------- | ---- | --------------------------------------------------------- | --------------------------------------------------------- |
| `CLIENT_NOT_FOUND`               | 404  | unknown / malformed client id (non-disclosing)            | not-found state; treat as "not available"                 |
| `CLIENT_LOGO_NOT_FOUND`          | 404  | stream requested but the client has no current logo/thumb | render a placeholder / initials; hide the image slot      |
| `CLIENT_LOGO_INVALID`            | 400  | upload is not a decodable image                           | field error on the file input; ask for a valid image      |
| `CLIENT_LOGO_TYPE_UNSUPPORTED`   | 415  | type not JPEG/PNG/WebP (incl. SVG, or spoofed extension)  | field error: "Use a JPEG, PNG, or WebP image"             |
| `CLIENT_LOGO_TOO_LARGE`          | 413  | original exceeds the 5 MB limit                           | field error: "Image must be ≤ 5 MB"; offer to compress    |
| `CLIENT_LOGO_DIMENSIONS_INVALID` | 400  | original exceeds 4096×4096                                | field error: "Image must be ≤ 4096×4096"; offer to resize |
| `CLIENT_RECORD_LOCKED`           | 423  | staff upload/remove on an admin-locked client             | show lock banner; disable the logo upload/remove controls |
| `CLIENT_ARCHIVED`                | 409  | upload/remove on an archived client                       | show archived state; logo is read-only until restored     |

## 6. Examples

```jsonc
// POST /api/v1/clients/6f1c…/logo/ — multipart/form-data (one file part)
// file=<binary image/png>

// 201 — response.data (LogoUploadResult)
{
  "logo_id": "b2d9e4a1-7c05-4f3a-9e21-8a1c2f3b4d5e",
  "checksum": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
  "mime_type": "image/png",
  "width": 800,
  "height": 800,
}

// Rendering the logo — the client read carries authenticated stream URLs:
//   GET /api/v1/clients/6f1c…/  →  data.logo_url, data.logo_thumbnail_url
// Fetch the bytes WITH the bearer token, then render an object URL:
const res = await fetch(client.logo_url, {
  headers: { Authorization: `Bearer ${accessToken}` },
});
const objectUrl = URL.createObjectURL(await res.blob());
// <img src={objectUrl} /> — a bare <img src={client.logo_url}> only works if the
// app forwards the Authorization header to the stream endpoint.
```

## 7. UI / integration notes

- **Concurrency:** N/A — the logo carries no `record_version`. The **parent** client's
  lock/archive guard still applies to writes (`423` / `409`).
- **Role projection:** uniform — staff and admin see the same surface (no field
  deltas, no non-disclosing 404 specific to logo beyond the client's own).
- **Dates:** None — no user-facing date fields, so no `*_bs` siblings here.
- **Server-computed (never send):** everything except the multipart `file` — the
  logo is fully server-authored. Read `logo_id` / `checksum` / `mime_type` /
  `width` / `height` back from the upload result if you need them.
- **Media / streaming:** the image is **private** — served only through the
  authenticated `GET .../logo/` and `GET .../logo/thumbnail/` streams (raw bytes,
  not JSON). Use `logo_thumbnail_url` in list rows and `logo_url` in the detail
  view; both come from the client read (or are `null` when unset). Fetch with the
  bearer token and render an object URL — a plain `<img src>` only works if the app
  forwards auth to the stream. Use the `null` URLs to decide whether to fetch at all.
- **Soft replace/remove:** a "remove logo" control retires the current logo (the
  file is retained for historical snapshots); a new upload replaces it. After either,
  invalidate the client detail/list query so `logo_url` / `logo_thumbnail_url`
  refresh.
- **State mapping:** `404 CLIENT_LOGO_NOT_FOUND` → placeholder / initials;
  `415 CLIENT_LOGO_TYPE_UNSUPPORTED` / `400 CLIENT_LOGO_INVALID` /
  `413 CLIENT_LOGO_TOO_LARGE` / `400 CLIENT_LOGO_DIMENSIONS_INVALID` → file-input
  field error; `423 CLIENT_RECORD_LOCKED` → lock banner + disabled controls;
  `409 CLIENT_ARCHIVED` → archived / read-only state.
  </content>
  </invoke>
