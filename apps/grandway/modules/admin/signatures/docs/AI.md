# Signatures Module — AI Navigation Map

## Purpose

The **signatory library**: the certificate signers a document may name, and their
signature images. A signatory is **not a system user** — no login, no account,
no FK to `authenticate` for the signer (only `created_by` for the Admin who
added the row).

Backend base path is `/api/v1/document-templates/signatories/`. Contract:
`apps/grandway/docs/backend/document-templates/` (v1.2.0). The backend app is
`document_templates`, which also owns a template-slug catalogue this module does
**not** cover — `modules/documents` reads that half directly.

## Module type

ModalModule — **no route of its own.** `/admin/signatures` does not exist and
should not be created; the editor's Signature button opens `SignatureManagerModal`
in place. The library is curated while writing a certificate, so navigating away
from the document is the wrong shape.

## Entry points

| Surface                          | Export                      | Component                        |
| -------------------------------- | --------------------------- | -------------------------------- |
| Document editor top bar (button) | `SignatureManagerModal`     | \_shared/SignatureManagerModal/… |
| Certificate signature rendering  | `useResolvedSignatureImage` | \_shared/useResolvedSignature.ts |
| Certificate picker feed          | `useActiveSignatories`      | signatures.hooks.ts              |
| Picker "(no image)" annotation   | `signatureSourceSuffix`     | signatures.labels.ts             |

## Dependency direction — read before editing

**This module imports nothing from `modules/documents`.** `documents` consumes
the signatory domain from here: `documents/hooks/useSignatures.ts` is a thin
mapper over `useActiveSignatories`, and `documents.types.ts`'s `Signature` is a
narrower render shape derived from this module's `Signatory` DTO.

That direction is the reverse of what an older comment in `documents/utils/`
assumed. **Do not flip it back** — `DocHeader` imports this module's barrel, so
any import of `documents` from here closes a cycle.

The module's own outbound dependency is `@/modules/admin/uploaded-files` (via its
barrel), for `useFileBlob`.

## Access

**Admin only, on every route including `GET`.** `lead_manager` _and_
`superadmin` are both refused 403 `DOCUMENT_TEMPLATES_ACTOR_FORBIDDEN`. The rule
is inherited from the consumer — a Lead Manager cannot open a document
workspace — not from the sensitivity of a name and a job title.

Gated by **`caps.signatories`**, deliberately **not** `documentWrite`. They
coincide for every tier today, but they encode different backend rules, and this
one also refuses `superadmin`. The contract's instruction is to **hide** these
surfaces, never render them read-only.

## Data layer (module root)

| File                    | Holds                                                                                                       |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| signatures.types.ts     | `Signatory`, `SignatureFile`, `SignatoryStatus`/`SignatorySource`, create/update/status payloads, `*Values` |
| signatures.labels.ts    | Status labels/colours/hints, source labels, `signatureSourceSuffix`, upload extension + size limits         |
| signatures.queryKeys.ts | `signatoryQueryKeys` (`createQueryKeys`) + `signatoriesListKey(filters)` + `activeSignatoriesKey()`         |
| signatures.api.ts       | `createResourceApi` for list/get/create/update, plus the two routes it cannot express (see below)           |
| signatures.hooks.ts     | `useSignatoryList`, `useSignatoryDetail`, `useActiveSignatories`, and four mutations                        |

## The five things that are load-bearing

1. **`signature_source` is the only field to branch rendering on.** A signature
   can arrive as an uploaded file or as an external URL, and the uploaded one
   always wins. `signature_file` is `null` in **three** different situations —
   never uploaded, archived, superseded — which are indistinguishable from the
   payload. A client-side `signature_file !== null` test would keep rendering a
   signature an Admin had deliberately withdrawn. `useResolvedSignatureImage` is
   the single place that branch is made.

2. **`download_path` is a `fetch` target, not an `<img src>`.** It answers
   `Content-Disposition: attachment` and 401s an unauthenticated image request.
   Bytes are fetched through `useFileBlob` and handed over as an object URL,
   which that hook also revokes. Its query key sits **outside** every
   invalidation tree with `staleTime: Infinity` — bytes are immutable per file
   id, a replacement is a new id, and **every download writes an audit event**
   (the project's only audited read). Do not "fix" that key.

3. **Two routes do not fit `createResourceApi`.** Status is a sub-route POST
   (`action(id, "status", body)`), and the upload is `multipart/form-data` and
   hand-rolled with `MULTIPART_HEADERS = { "Content-Type": undefined }` — the
   shared Axios instance defaults to JSON and would otherwise stringify the
   `FormData`. Sending JSON to the upload route returns a bare **415** with no
   error code in the body.

4. **There is no delete, anywhere.** `remove` is never re-exported from
   `signatures.api.ts`; that file is the boundary keeping it unreachable.
   Retirement is `POST .../status/ { status: "inactive" }`, and removing a
   _signature_ is archiving its file — **cross-app**,
   `POST /api/v1/files/<file_id>/archive/` with a required non-blank `reason`.
   The backend pins four plausible delete-service names in a no-delete test.

   `useRemoveSignatorySignature` wraps that call and **invalidates both trees**.
   It cannot reuse `uploaded-files`' own `useArchiveFile`, which invalidates only
   the files tree — the row that visibly changes is the _signatory_, and without
   that the panel would keep rendering a signature just withdrawn.

5. **Upload needs an id, so create is two requests — but one action.**
   `POST /signatories/` is JSON and always lands `draft`; the image is a second
   call against the id that create returns. **That sequencing is a backend
   constraint and is deliberately hidden**: `SignatoryCreateForm` carries the
   dropzone alongside the detail fields and chains the two calls behind one
   submit. Do not "simplify" it back into a URL-only create form.

   **The two halves fail independently and that is handled, not hidden.** If the
   create succeeds and the upload does not, the signatory really exists as a
   draft; the form hands the id up regardless and lands on the edit screen where
   the image panel is waiting. Rolling back is not an option — there is no
   DELETE anywhere in this API.

   Uploading again **replaces** (the predecessor is versioned, not duplicated),
   and any status may receive a signature — a retired signer's certificates must
   stay reprintable.

## The upload control

`SignatureDropzone` is used in **both** the create form and the edit screen's
image panel, and validates through the same `signatureFileSchema`. It is a
drag-or-click `Dropzone` (from `@peppermint/ui/dropzone`,
a **subpath export** — not in the main barrel) that **previews the picked file
before it is sent**. That preview is not decoration: the backend does no
thumbnailing, no dimension check and no crop, so whatever is uploaded is exactly
what prints on every certificate. It is the only chance to catch a scan that is
rotated, cropped wrong, or on a black background.

The preview's object URL is minted in an effect and revoked in its cleanup, for
the same reason `useFileBlob` does it that way — only an effect's cleanup is
guaranteed to run before the next one.

## Two things the UI cannot pre-empt

- **Content mismatch.** A PDF renamed `signature.png` passes the client-side
  extension check and is refused by the server on its leading bytes. It arrives
  as a notification, and the upload panel stays open.
- **Two file parts** raise during multipart parsing and surface as a **500**,
  not a 400. Send exactly one.

## Known consequence, by design

Replacing a signature **rewrites the past**: `document_history` freezes a
signatory's id, name and role into a snapshot but **never the image**, so a
reprint resolves the signature live. The backend records this as a
non-repudiation weakness it will not fix — pinning the image at print time would
be a client decision. See `docs/backend/document-templates/INTEGRATION.md` §9.
