# FLOWS — Document Templates

**Owner app:** `document_templates`
**Synced:** 2026-07-25, adapted from `.backend/concepts/document_templates_flows.md`
**Purpose:** Connects `CONCEPT.md`'s product intent to the callable endpoints in `INTEGRATION.md`.

> **Five things govern every flow below.**
>
> 1. **Admin only — a Lead Manager cannot open any of these screens.** Not
>    read-only, not empty: **hidden**. Not because the data is sensitive (there is
>    no applicant data here), but inherited from the consumer.
> 2. **This module stores what is _offered_, not what is _rendered_.** Nothing
>    here describes sections, field layout, or how a document draws itself, and no
>    endpoint ever will — see "Not backed" before designing a Template Editor.
> 3. **Everything is created as `draft`.** A signatory or template you just
>    created will **not** appear in a picker filtered to `?status=active`.
>    Activation is a separate, deliberate call.
> 4. **Nothing is ever deleted.** No `DELETE` on any route, and **no 409
>    anywhere**. Retirement is a status change; a retired record stays retrievable
>    by id forever.
> 5. **Both of this module's libraries are advisory.** `documents` does not check
>    the template catalogue and does not validate signatory ids. **Your picker is
>    the only guard.**

---

## Flow: Add a certificate signer

**Actor:** Admin · **Entry point:** Signatory Library

1. **Signatory Library** loads what exists → `GET /api/v1/document-templates/signatories/` (`document_templates.signatory.list`). Omit `status` — a management screen shows draft and retired signers, not just active ones. A Lead Manager receives 403 `DOCUMENT_TEMPLATES_ACTOR_FORBIDDEN`; hide the entire screen.
2. **Signatory Library → Add** → `POST /api/v1/document-templates/signatories/` (`document_templates.signatory.create`) with `{ name (required), title?, role?, signature_image_url? }` → `Signatory`, `status: "draft"`. **Host the signature image yourself first — there is no upload; do not ship a file-picker control.**
   - `VALIDATION_ERROR` on `name` → the name is mandatory; make it a required field.
   - `VALIDATION_ERROR` on `signature_image_url` → it must be a well-formed URL. The API never fetches it, so a well-formed link to nothing passes.
3. **Activate** once the signature is in place → `POST /api/v1/document-templates/signatories/<id>/status/` with `{ "status": "active" }` (`document_templates.signatory.change_status`). **This step is not optional** — a `draft` signer never appears in the picker; a UI that omits it looks broken. Any transition, any order; the note is optional.

## Flow: Fill the instructor and director selects

**Actor:** Admin · **Entry point:** Document Workspace → certificate form (cross-app: `documents`)

1. **Load the options** → `GET /api/v1/document-templates/signatories/?status=active` (`document_templates.signatory.list`). **This is the one call the frontend makes into this module.** Render `name` plus `title`; send the row's **`id`**. **Do not filter the dropdown by `role`** — a director may legitimately sign as the instructor.
2. **Save the document** with the chosen ids → `PATCH /api/v1/documents/<document_id>/` (`documents.document.update`, **cross-app: `documents`**). Put the ids in `content.instructorId` / `content.directorId` and send the **complete `content`** (that app replaces the body wholesale). **Nothing validates these ids** — a typo, a stale id, or a `draft` signatory's id all return 200. **Your dropdown is the only guard.**
3. **Freeze the resolved signer into the snapshot** → `POST /api/v1/document-history/documents/<document_id>/snapshots/` (`document_history.snapshot.capture`, **cross-app: `document_history`**). Freeze the signatory's `name` and `role` alongside the `id` in `render_context.signatories` — an id alone leaves the snapshot dependent on a later lookup that may return a since-renamed record.

## Flow: Retire a signer who has left

**Actor:** Admin · **Entry point:** Signatory Library

1. `POST /api/v1/document-templates/signatories/<id>/status/` with `{ "status": "inactive" }` (`document_templates.signatory.change_status`). **Label the button "Retire", not "Delete"** — the record is kept because snapshots reference it. Reversible: the same endpoint with `active` brings them back.
2. **Consequences to surface in the UI, because the API will not:**
   - The signer disappears from `?status=active` immediately.
   - **Every existing document naming them still renders their name**, because `documents` stores only the id and resolves it at render time.
   - **A retired signer is still retrievable by id** forever — that is deliberate.

## Flow: Retire a bank partner from the document picker

**Actor:** Admin · **Entry point:** Template Catalog

1. **Find the row** → `GET /api/v1/document-templates/templates/?family=bank_statement` (`document_templates.template.list`). Rows arrive grouped by `family` and ordered by `display_order` — render in that order rather than re-sorting alphabetically.
2. **Retire it** → `POST /api/v1/document-templates/templates/<id>/status/` with `{ "status": "inactive", "note": "Partner closed." }` (`document_templates.template.change_status`). **No document changes and none can break** — `documents` never reads this table. **No failure branch worth handling — this module has no 409 anywhere.**
3. **New Document Form** — the picker, fed by `?status=active`, stops offering it. **Existing documents using that slug remain fully editable**; blocking them is a client decision this API will not make.

## Flow: Register a new template slug

**Actor:** Admin · **Entry point:** Template Catalog → Add

1. `POST /api/v1/document-templates/templates/` (`document_templates.template.create`) with `{ key (required), family (required), label (required), description?, display_order? }`. **This does not make the template renderable** — the frontend must already support the slug; registering only makes it _offerable_. **Send `key` and `family` from one control** — they are cross-validated, so a `bank-` slug under family `lor` is refused.
   - `DOCUMENT_TEMPLATES_KEY_ALREADY_EXISTS` → the slug is registered; offer to edit the existing row.
   - `DOCUMENT_TEMPLATES_TEMPLATE_KEY_INVALID` → the slug and family disagree — a UI bug, not user error, if they came from one control.
   - `VALIDATION_ERROR` on `key` → malformed slug (uppercase, spaces, or underscores).
   - **Create-error precedence:** serializer → uniqueness (`KEY_ALREADY_EXISTS`) → family agreement (`TEMPLATE_KEY_INVALID`). Highlight the field named in `details`.
2. **Publish it** → `POST /api/v1/document-templates/templates/<id>/status/` with `{ "status": "active" }`. A newly registered template is `draft` and will not appear in the picker until this runs.
3. **The ~53 slugs already in use are seeded**, not created through this flow — this flow is for the 54th. (Note the seed-vs-render count discrepancy in `INTEGRATION.md` §9.)

## Flow: Correct a signatory or template

**Actor:** Admin · **Entry point:** Signatory Library / Template Catalog → edit

- **Signatory** → `PATCH /api/v1/document-templates/signatories/<id>/` with any subset of `name`, `title`, `role`, `signature_image_url`. **`status`/`status_note` are rejected** (400 `DOCUMENT_TEMPLATES_STATUS_IMMUTABLE`) — use the status action. **Renaming retroactively changes what every past document appears to say** (id-resolved at render time); a snapshot is the exception, showing the frozen old name.
- **Template** → `PATCH /api/v1/document-templates/templates/<id>/` with any subset of `family`, `label`, `description`, `display_order`. **`key` is rejected** (400 `DOCUMENT_TEMPLATES_KEY_IMMUTABLE`), not dropped; `status`/`status_note` likewise. Changing `family` re-runs the agreement check against the existing `key`, so most family edits fail — intended.

---

## Endpoint coverage

| Policy key                                   | Method / path                                              | Used by flow(s)                                   | Notes                                                            |
| -------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------- |
| `document_templates.signatory.list`          | `GET /api/v1/document-templates/signatories/`              | Add a signer; Fill the selects; Retire a signer   | **The frontend's only call into this module** (`?status=active`) |
| `document_templates.signatory.create`        | `POST /api/v1/document-templates/signatories/`             | Add a signer                                      | Always creates as `draft`                                        |
| `document_templates.signatory.read`          | `GET /api/v1/document-templates/signatories/<id>/`         | —                                                 | Resolving a single id (e.g. a retired signer)                    |
| `document_templates.signatory.update`        | `PATCH /api/v1/document-templates/signatories/<id>/`       | Correct a signatory                               | `status`/`status_note` rejected; use the status action           |
| `document_templates.signatory.change_status` | `POST /api/v1/document-templates/signatories/<id>/status/` | Add a signer; Retire a signer                     | **The activate / retire button**                                 |
| `document_templates.template.list`           | `GET /api/v1/document-templates/templates/`                | Retire a partner; New Document picker (cross-app) | `?family=`, `?status=`, `?search=`                               |
| `document_templates.template.create`         | `POST /api/v1/document-templates/templates/`               | Register a slug                                   | `key` + `family` cross-validated                                 |
| `document_templates.template.read`           | `GET /api/v1/document-templates/templates/<id>/`           | —                                                 | Single-row inspection                                            |
| `document_templates.template.update`         | `PATCH /api/v1/document-templates/templates/<id>/`         | Correct a template                                | `key` **immutable**, rejected not dropped                        |
| `document_templates.template.change_status`  | `POST /api/v1/document-templates/templates/<id>/status/`   | Retire a partner; Register a slug                 | **The publish / retire button.** No 409 possible                 |

**Screens from `concepts/document_templates.txt`, and whether they are backed:**

- **Signatory Library** — **fully backed** (list, create, edit, retire).
- **Template Catalog** — **backed** (list with family/status filters, create, edit, retire).
- **Template Detail / Version History** — detail read exists; **the version half never will** — there is no version chain.
- **Template Editor** — **not backed** beyond label, description, family, and display order. No section order, field hints, or signature slots.
- **Template Preview** — **not backed.** No endpoint returns anything renderable.

**Not backed, and deliberately so:** template versions/sections/field hints/signature slots (the templates are frontend code); historical reproduction _through_ this module (`document_history` freezes context into each snapshot instead); signature image upload (`signature_image_url` is a link); and lookup-by-key (every route takes the UUID `id`).

## Cross-app dependencies

- **References (outbound):** `none` at the HTTP level — no flow here calls another app's endpoint. The backend imports three Python objects from `documents` (the `family` enum, the slug validator, the key/family rule) — no database relation to any app but `authenticate`. The "Fill the selects" flow's steps 2–3 are cross-app calls into `documents` and `document_history`, made by the document workspace, not this module.
- **Referenced by other apps (inbound):** `documents` — its New Document picker calls `template.list` and its certificate form calls `signatory.list`. `document_history` references the signatory picker for the ids frozen into `render_context.signatories`. **Both references are advisory** — neither app validates what this one publishes.

**Note the asymmetry.** `documents` depends on neither sibling. `document_history` holds real foreign keys to `documents`. This app holds no database relation to either and is consulted by neither — it publishes two libraries clients are trusted to use.

## Open questions

- **Is the real slug count 42 or 53?** The frontend contract heads its list "42 slugs" and lists 53; the seed loads ~42. If 42 is right, ~eleven seeded rows name templates the frontend cannot render, and the picker would offer them. **Unresolved.**
- **Should `documents` enforce the catalogue?** Today a `template_key` absent from it, or retired, is still accepted. Enforcing would narrow a shipped endpoint's input and add a runtime dependency — deferred.
- **Should `documents` validate signatory ids?** Same shape, harder — it would mean parsing `content` per template shape, which that app refuses to do.
- **Should a template ever be renderable-but-not-offerable, or vice versa?** The catalogue and the frontend's union are maintained independently, so either can hold a slug the other lacks, with nothing reporting the mismatch.
