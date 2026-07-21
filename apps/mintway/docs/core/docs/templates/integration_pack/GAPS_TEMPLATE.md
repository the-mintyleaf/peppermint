<!-- Copy to `<app>/docs/integration/gaps.md` and fill in. This is where anything
     the source does NOT answer goes — as a QUESTION, never a guess. If you were
     tempted to invent a field/type/default/error, it belongs here instead. When
     a gap is resolved, delete its row and fold the truth into the entity file. -->

# Gaps & assumptions

What the backend docs do **not** answer. Each entry is a question for the backend
or an assumption the frontend is making — **ask, don't invent**. Nothing here may
be silently resolved in code without confirmation.

| #   | Gap                                  | Impact on frontend                           | Assumption (if any)                   | Where the assumption lives              |
| --- | ------------------------------------ | -------------------------------------------- | ------------------------------------- | --------------------------------------- |
| 1   | `<what the source doesn't pin down>` | `<what the frontend can't do because of it>` | `<the interim assumption, or "none">` | `<file §section / api-client location>` |

> When a gap is resolved (backend answers, or a new pack version lands), delete
> its row and fold the truth into the relevant entity file — don't leave stale
> assumptions.

<!-- If the source genuinely answers everything, keep the heading and the table
     header and write a single row "None — no open questions at this version." -->
