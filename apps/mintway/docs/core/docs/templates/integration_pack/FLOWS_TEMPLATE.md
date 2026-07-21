<!-- Copy to `<app>/docs/integration/flows.md` and fill in. Only end-to-end
     sequences that span MORE THAN ONE entity belong here — the choreography.
     Field/error detail stays in the entity files; each step names the endpoint,
     the key inputs, and the failure branches the UI must handle. -->

# Flows

End-to-end sequences that span more than one entity. Each step names the
endpoint, the key inputs, and the branches the UI must handle. Field/error detail
lives in the entity files — this is the choreography.

## `<Flow name — e.g. "Staff intake of a new lead">`

1. `<METHOD> /api/v1/<...>/` → `<what it returns / the id threaded forward>`.
   - `<ERROR_CODE>` → `<what the user should do>`.
2. `<METHOD> /api/v1/<...>/<id>/<...>/` → `<result>`.
   - `<ERROR_CODE>` → `<recovery>`.

<!-- Add 2–5 flows. Use `> ` callouts for non-obvious rules (e.g. a jump that
     requires a reason). If the module has no cross-entity sequence yet, write
     "None." — don't invent one. -->
