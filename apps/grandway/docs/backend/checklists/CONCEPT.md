# CONCEPT — Checklists

Grounding file, adapted from `.backend/concepts/checklists.txt`. Freeform
prose — the formal contract lives in `INTEGRATION.md`.

## Purpose

`checklists` answers one question for every applicant on the books: what is
still missing before this person's file is ready? It answers it the way the
office actually works — an Admin writes down, once, what a destination country
requires (the documents to collect, the stages to reach), and when an applicant
settles on that country, that list becomes theirs automatically. Two applicants
headed for Australia face the same requirements and are tracked entirely
separately.

## Why it exists

Grandway spreads work across several domains — `applicants` holds the person,
`applicant_journeys` holds the study objective and destination, `institutions`
holds the country/institution/program catalogue, `documents` /
`document_history` / `document_templates` hold document records and their
templates, `uploaded_files` holds file assets, and `offers` holds admission
decisions. `checklists` sits above those records and answers something none of
them do: what is outstanding, who owns it, when is it due, and is it done. It
does not duplicate their business data — it points at those records and
summarizes progress across them.

## Country templates

The module's centre of gravity is the **checklist template** — one country's
requirement list, authored by an Admin.

- A template belongs to a country from the `institutions` catalogue.
- One active template per country is marked the **default**: the list that
  country's applicants inherit. The database enforces "at most one", because
  automatic inheritance has to resolve "the checklist for this country" to
  exactly one answer.
- Extra templates for the same country are allowed and stay available to apply
  by hand — a scholarship route, a particular institution's extra paperwork.
- A template with no country is a general list, applied only manually.

Adding a destination's requirements is **data entry — never a migration and
never a deployment**. The office that learns Canada now wants a fresh six-month
bank statement is not the office that can ship code, and it should not have to
be. Templates are drafted, activated, and eventually retired. Nothing is
deleted: an applicant's checklist points back at the template it came from, and
that has to keep resolving.

## Automatic inheritance

When a journey's target country is set, that country's default checklist is
created for that applicant. No one asks for it — choosing the destination _is_
the request. Three things about how it behaves:

1. **It is a snapshot, not a subscription.** The template's requirements are
   copied into real rows on the applicant's own checklist. An Admin who later
   adds a requirement to the Australia template changes what _future_ applicants
   inherit and nothing about anyone already being worked. Someone halfway
   through collecting documents does not have the target moved.
2. **It happens once.** Re-saving the journey never produces a second copy —
   unless the first was archived, in which case re-saving is how a fresh copy is
   picked up.
3. **It is quiet when it cannot act.** A country with no authored template
   produces no checklist and no error — an empty list would read as "nothing is
   required of this applicant", which is never true. Those journeys appear on a
   dedicated worklist so the silence is visible, and a management command
   applies the list retroactively once someone authors it.

Staff can still apply a template by hand — a non-default one, or a fresh copy
after archiving the old.

## Subject: one journey, which means one applicant

A checklist belongs to an applicant journey. The journey is where the
destination lives, and the destination is what the checklist is for. In
practice that is one checklist per applicant: a lead may be interested in
several countries, but once they convert they have one, and if they later change
their mind about the destination their current profile is closed and they
register again. A live applicant is always working towards exactly one country.
Clients read it as the applicant's checklist: one call, filtered by applicant.

## Item model

A checklist item answers: what is required and **what kind of thing it is** — a
`document` to collect from the applicant, a `stage` the office must reach, or a
`task` to perform; whether it is required or optional; who is responsible; when
it is due; whether it is pending, completed, waived, blocked, or not applicable;
and what evidence proves it — an uploaded file, a note, or both. Typing items is
what lets one screen separate "what is this applicant still missing" from "where
are they in the process" — both on the same list, but not the same question.

Evidence must be a file belonging to this applicant or their journey. Citing
someone else's document as proof is refused. **Completion is derived from the
item states, never asserted** — a checklist can be marked complete only when
every required item is completed, waived, or marked not applicable. A _blocked_
item still blocks — it is precisely the status that means the work did not
happen. Waiving an item or declaring it blocked requires a note; both are
judgements someone will be asked about months later.

## Lifecycle

A checklist is `draft`, `active`, `completed`, or `archived`. "In progress" and
"partially complete" are **not stored** — they are derived by counting item
statuses, so a progress figure can never disagree with the items it summarizes.

- Inherited checklists arrive `active`. A blank one staff build by hand starts
  as a `draft` and is activated when it is ready.
- `completed` is reversible: a completed checklist is reopened before its items
  can change again. It is not locked forever, but not silently editable either —
  "complete" is a claim someone made about a moment in time.
- `archived` takes a checklist out of active work without erasing it, and
  requires a reason. Archiving is also how staff ask for a fresh copy of a
  country's list: an archived checklist no longer blocks re-inheriting. Restore
  returns a checklist to exactly the status it held when archived — it is not a
  reopen.

## Access

- **Only an Admin authors a template.** A template is a policy statement that
  propagates automatically to every future applicant for that country; editing
  one silently changes what dozens of files will be measured against.
- **Admin and Lead Manager both track.** Collecting a passport scan and ticking
  it off is the Lead Manager's daily job. Routing every tick through an Admin
  would put an approval gate on clerical work, and gates on clerical work get
  worked around.
- **Superadmin has no access** to any route in the module.

## No deletion

Nothing is deleted. A template requirement that no longer applies is retired
(`is_active: false`), not removed, because existing checklist items hold a
protected reference to the definition they were copied from. A checklist item
added by mistake is set `not_applicable` — there is no way to remove one.

## UI screens & wireframe notes

- A **checklist panel** inside the Applicant and Journey screens — the primary
  place it is seen.
- A **standalone worklist** with filters: status, owner, country, overdue,
  blocked.
- **Item-level status updates** with evidence attachment.
- **Document progress and stage progress shown separately.**
- A **template authoring screen** for Admins, one list per country.
- The **"journeys awaiting a checklist" view** — countries nobody has authored
  yet. The checklist should feel embedded in the day-to-day workflow, not like a
  separate task manager.

## Boundaries / Out of scope

`checklists` does not render documents, manage document template definitions,
store file blobs, replace offer conditions as the source of truth, duplicate
applicant or journey data, or act as a generic notes app or task manager. It
only references records in `documents`, `document_history`, `document_templates`,
`uploaded_files`, `offers`, and `institutions` to show work remaining.

## Resolved questions

- **Do checklists need reusable templates in v1?** Yes — country templates are
  the whole feature, not an optional extra.
- **Can one checklist span multiple subjects?** No. One journey, which in
  practice means one applicant.
- **Which item statuses are required at launch?** Five: pending, completed,
  waived, blocked, not applicable.
- **Should completed checklists be locked from edits?** Reopenable, not locked.
- **How much belongs inside applicant screens versus a standalone workspace?**
  Both — the same list, filtered.

## Still open

- Should overdue and blocked items raise notifications once the `notifications`
  app exists?
- Should a checklist item be able to point at a specific offer condition, so the
  two stop being tracked separately?
- Should a country's template carry a study-level dimension, or is one template
  per situation enough?
