# `Media` — private profile image + evidence files

**Endpoint base:** two surfaces over the same `ApplicantMedia` resource —

- **Profile image** (staff+): `GET`/`POST
/api/v1/applicants/<applicant_id>/profile-image/`.
- **Evidence media** (admin only): `GET`/`POST
/api/v1/applicants/<applicant_id>/media/`, detail `GET`/`DELETE
.../media/<media_id>/`.

**Access:** the **profile image** endpoint is **staff and above** (honours the
applicant lock for staff → 423). **Evidence media** is **admin/superadmin only**
(staff → 403). Every file is stored in **private storage** — there is **no public
URL**; bytes are served only through the authenticated streaming endpoint.
**Owns:** file metadata + the file itself. The `profile_photo` category has its
own dedicated endpoint; the evidence upload endpoint **excludes** it.

## 1. Fields (rows)

Read metadata (`MediaReadSerializer`) — every field is response-only. Uploads are
multipart; the file part and (for evidence) `category` are the only inputs.

| Field                   | TS type                | In req | In res | Req | Nullable | Server-set | Enum                          | Validation                             | Notes                                       |
| ----------------------- | ---------------------- | ------ | ------ | --- | -------- | ---------- | ----------------------------- | -------------------------------------- | ------------------------------------------- |
| `id`                    | `string`               | ✗      | ✓      | —   | No       | ✓          | —                             | UUID                                   | Primary key (`media_id`)                    |
| `category`              | `MediaCategory`        | ✓¹     | ✓      | ✗   | No       | ✗¹         | `Media.category`              | non-`profile_photo` on evidence upload | ¹ evidence upload only; profile is implicit |
| `original_filename`     | `string`               | ✗      | ✓      | —   | No       | ✓          | —                             | ≤255 chars                             | Not trusted for the storage path            |
| `mime_type`             | `string`               | ✗      | ✓      | —   | No       | ✓          | —                             | —                                      | Derived from decoded content, not client    |
| `size_bytes`            | `number`               | ✗      | ✓      | —   | No       | ✓          | —                             | —                                      |                                             |
| `checksum`              | `string`               | ✗      | ✓      | —   | No       | ✓          | —                             | sha-256                                |                                             |
| `confidentiality_level` | `ConfidentialityLevel` | ✗      | ✓      | —   | No       | ✓          | `Media.confidentiality_level` | —                                      | Default `protected`                         |
| `is_current`            | `boolean`              | ✗      | ✓      | —   | No       | ✓          | —                             | —                                      | Prior current photo retired on new upload   |
| `created_at`            | `string`               | ✗      | ✓      | —   | No       | ✓          | —                             | ISO 8601                               |                                             |
| `file`                  | `File`                 | ✓      | ✗      | ✓   | —        | ✗          | —                             | multipart                              | Upload part; never echoed as data           |
| `application_case_id`   | `string`               | ✓²     | ✗      | ✗   | —        | ✗          | —                             | UUID; same applicant                   | ² evidence upload only; optional case link  |

## 2. Types

```ts
type MediaCategory =
  | "profile_photo"
  | "passport_photo"
  | "passport_scan"
  | "citizenship_scan"
  | "national_id_scan"
  | "birth_certificate"
  | "academic_document"
  | "language_certificate"
  | "financial_evidence"
  | "visa_document"
  | "application_document"
  | "other"; // see enums.md
type ConfidentialityLevel = "basic" | "protected" | "highly_protected"; // see enums.md

interface Media {
  id: string;
  category: MediaCategory;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  checksum: string;
  confidentiality_level: ConfidentialityLevel;
  is_current: boolean;
  created_at: string;
}

// Profile-image upload — multipart, single file part; category is implicit
interface ProfileImageUpload {
  file: File; // JPEG/PNG/WEBP, ≤5 MB
}
// Profile-image upload response (not the full Media shape)
interface ProfileImageUploadResult {
  media_id: string;
  checksum: string;
  mime_type: string;
}

// Evidence upload — multipart; category required, excludes profile_photo
interface EvidenceMediaUpload {
  category: Exclude<MediaCategory, "profile_photo">;
  file: File; // image ≤5 MB, or PDF ≤10 MB
  application_case_id?: string; // optional case link, same applicant
}
```

## 3. Endpoints

### `GET /api/v1/applicants/<applicant_id>/profile-image/`

- **Purpose:** show the current profile photo. **Staff+.**
- **Returns:** the image **bytes** streamed from private storage
  (`Content-Disposition: inline`) — **not JSON**. `404` `APPLICANT_MEDIA_INVALID`
  when no photo is set.
- **Policy key:** `applicant.media.read_profile_image`

### `POST /api/v1/applicants/<applicant_id>/profile-image/`

- **Purpose:** upload / replace the profile photo. **Staff+.**
- **Request:** multipart `ProfileImageUpload` (`file`).
- **Returns:** `ProfileImageUploadResult` (`{ media_id, checksum, mime_type }`).
- **Side effects:** retires the prior current profile photo; honours the applicant
  lock for staff (423).
- **Policy key:** `applicant.media.upload_profile_image`

### `GET /api/v1/applicants/<applicant_id>/media/`

- **Purpose:** list evidence metadata. **Admin only.**
- **Returns:** `list[Media]`.
- **Query params:** `?include_archived=true` to include retired media.
- **Policy key:** `applicant.media.list`

### `POST /api/v1/applicants/<applicant_id>/media/`

- **Request:** multipart `EvidenceMediaUpload`. Images (Pillow-verified, ≤5 MB) or
  PDF (`%PDF-`, ≤10 MB); `profile_photo` category is rejected here.
- **Returns:** the created `Media`.
- **Policy key:** `applicant.media.upload`

### `GET /api/v1/applicants/<applicant_id>/media/<media_id>/`

- **Returns:** the file **bytes** streamed (`inline`) — not JSON. No public URL.
- **Policy key:** `applicant.media.read`

### `DELETE /api/v1/applicants/<applicant_id>/media/<media_id>/`

- **Purpose:** soft-archive (files are never cascade-deleted).
- **Policy key:** `applicant.media.archive`

## 4. Validations & business rules

- **Profile image:** JPEG/PNG/WEBP only, ≤5 MB, verified by decoded content
  (shared `validate_profile_image`); MIME derived from content; SHA-256 stored.
- **Evidence:** the extension allow-list AND the decoded content must agree — a
  spoofed extension is rejected. Images ≤5 MB, PDFs ≤10 MB.
- Uploading a new profile photo **retires** the prior current one.
- Evidence `application_case_id`, when supplied, must belong to the **same
  applicant** — else rejected.

## 5. Errors

| Code                               | HTTP | Trigger                                                                                | Suggested UI handling                      |
| ---------------------------------- | ---- | -------------------------------------------------------------------------------------- | ------------------------------------------ |
| `APPLICANT_MEDIA_INVALID`          | 400  | corrupt file, cross-applicant reference; also `404` on profile-image GET when none set | inline upload error; empty state on GET    |
| `APPLICANT_MEDIA_TYPE_UNSUPPORTED` | 400  | extension/content not an allowed image or PDF                                          | reject at the file picker                  |
| `APPLICANT_MEDIA_TOO_LARGE`        | 400  | file exceeds the per-kind size limit                                                   | show the size cap (5 MB image / 10 MB PDF) |
| `APPLICANT_MEDIA_NOT_FOUND`        | 404  | unknown media under the applicant                                                      | refresh the media list                     |
| `APPLICANT_RECORD_LOCKED`          | 423  | staff profile-image upload while parent locked                                         | show lock banner; disable upload           |

## 6. Examples

```jsonc
// POST /api/v1/applicants/<id>/profile-image/ — multipart (file part only)
// file=<binary JPEG>

// 200 — response.data
{ "media_id": "md01…", "checksum": "9f86d081…", "mime_type": "image/jpeg" }

// POST /api/v1/applicants/<id>/media/ — multipart
// category=passport_scan
// file=<binary PDF>

// 201 — response.data
{
  "id": "md02…",
  "category": "passport_scan",
  "original_filename": "passport.pdf",
  "mime_type": "application/pdf",
  "size_bytes": 84213,
  "checksum": "e3b0c442…",
  "confidentiality_level": "protected",
  "is_current": true,
  "created_at": "2026-07-19T04:30:00Z",
}
```

## 7. UI / integration notes

- **Concurrency:** N/A — no `record_version` on media.
- **Role projection:** profile image is staff+; evidence media is admin-only
  (staff → 403).
- **Media / streaming:** both GET-by-id endpoints return **raw bytes**, not JSON —
  load them through the authenticated api client (blob/objectURL), never a bare
  `<img src>` to a CDN. There is no public URL.
- **Server-computed (never send):** everything except the upload `file`, and (for
  evidence) `category` + optional `application_case_id`. Build the `FormData` at
  the api layer.
- **Evidence category:** the picker must exclude `profile_photo` (use the
  dedicated profile-image endpoint for it).
- **Media ids** returned here are what identity documents / visa / consent records
  reference (`image_front`, `evidence_media`, …) — upload first, then link.
