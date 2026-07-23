# CONCEPT — Applicants

Grounding file, adapted from `.backend/concepts/applicants.txt`. Freeform prose —
the formal contract lives in `INTEGRATION.md`.

## Purpose

Applicants owns the permanent, authoritative record of a person the consultancy
is working with — who they are, not what they're trying to do. Study
objectives, destinations, intakes, budgets, and outcomes belong to
`applicant_journeys`; academic history, test attempts, and files belong to
modules that don't exist yet. There is exactly one applicant record per real
person — journeys and everything else reference it rather than copying a name
or phone number.

## How an applicant comes into existence

Lead conversion — an Admin converts a lead; identity/contact copies across and
the lead stays permanently linked, so origin and the originating Lead Manager
remain traceable.

Direct Admin creation — an Admin creates an applicant with no preceding lead
(a committed walk-in, a partner referral). No reason is required. A Lead
Manager cannot create an applicant by either path — entry into the applicant
lifecycle is an Admin decision; Lead Managers work leads.

Both paths record who created the record and when.

## Applicant information

Identity: full name (Devanagari + Roman), date of birth, gender, nationality.
Contact: multiple labelled numbers, one email, permanent + current addresses
(same "several numbers, one email" reasoning as leads). Passport: number,
issuing country, place of issue, issue/expiry dates — expiry matters
operationally (blocks visas) and should stay visually prominent. Family:
family members (relationship, name, occupation, contact) and emergency
contacts (kept distinct — an emergency contact may be a friend or landlord,
not a relative).

## Applicant status

Deliberately separate from any journey stage. Recommended V1: **Active**
(currently worked with), **Dormant** (no active work, may return), **Archived**
(closed, reversible, destroys nothing). Set manually — never as a side effect
of a journey opening, closing, or reaching an outcome.

## Visibility

Shared across the consultancy — any Admin or Lead Manager views/edits any
applicant. Deliberately unlike leads (owner-scoped): once someone is a client
rather than one Lead Manager's prospect, several staff legitimately work their
file. Lead-ownership attribution survives conversion but grants no exclusive
access to the resulting applicant.

## No deletion

Never deleted. A closed file is archived, reversibly. The record carries
identity, history, and origin attribution — deleting it would destroy the
consultancy's ability to explain its own past work.

## Correction and history

Corrected in place, not versioned. History should record: created (lead or
direct), identity/contact/address/passport/family/emergency-contact changed,
status changed. Never silently rewritten or removed.

## Permissions

**Admin** may: create directly, convert a lead, view/edit any applicant,
change status, archive/restore, review history.

**Lead Manager** may: view any applicant, edit any applicant's information,
change status, review history. May **not**: create an applicant by either
path, delete an applicant or any history.

**Superadmin**: no access — platform authority for Admin accounts only, does
not participate in consultancy operations.

## UI screens & wireframe notes

**Applicant List** — every applicant, newest first. Columns: name, status,
contact number, lead-origin flag, created date. Filters for status; one search
box matching Devanagari/Roman/romanized simultaneously. "New applicant" is
Admin-only.

**New Applicant Form** — Admin only. Sections: identity, contact numbers
(repeating, label + primary flag), addresses (permanent/current), passport,
family members (repeating), emergency contacts (repeating). Only name is
required.

**Applicant Detail** — header: name, status, link to originating lead when
one exists. Panels: identity, contact, addresses, passport (expiry
prominent), family, emergency contacts. A Journeys panel with "New journey".
A History panel. Status changes from a header control, never by editing a
field.

**Edit Applicant Form** — same layout as create, pre-filled. Nested
collections (contact numbers, addresses, family, emergency contacts) are
replaced as a complete set, never patched row by row.

## Constraints / Out of scope

Not system users, no self-service portal, no photograph in V1 (needs a
documented file contract from the not-yet-built uploaded-files module), no
duplicate detection/merging, no academic history/test scores/documents/files,
no deletion or hiding archival, no automatic status changes from journey
activity.

## Open questions

- Should passport renewals keep history, or does one current record (today's choice) suffice?
- Structured Nepal address hierarchy vs. free text — V1 offers both, rigidity undecided.
- Is nationality ever non-Nepali in practice?
- Should archiving an applicant affect their open journeys? V1: fully independent.
- Should passport/status become Admin-only fields? V1: full Lead Manager edit access.
- No defined process yet for linking a directly-created applicant to a lead discovered later.
