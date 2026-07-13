---
name: visual-review
description: >
  Captures screenshots of a running route at multiple breakpoints in light and
  dark mode (Playwright), then reads the images and audits them against the
  design doctrine. This is how the agent SEES what it built instead of shipping
  UI blind. Use after building or changing any visual module, before /pre-pr on
  UI work, or on request via /visual-review <route>.
---

# Visual Review

Screenshot → look → judge. The mechanical design scan (`/verify` Step 2b) greps
code; this skill audits the **rendered result** — the only place layout breaks,
contrast failures, competing anchors, and broken dark mode are actually visible.

## 1. Ensure a dev server

1. Probe: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` —
   any HTTP response means a server is up; reuse it and **do not kill it later**.
   Verify it is actually the target app (the first capture should render it — if
   the screenshots show something else, another service owns port 3000: start
   the app on a free port and pass that port in `--url`).
2. Otherwise start one in the background: `pnpm dev --filter <app>`, then poll
   the same curl until it responds (Next.js dev boot can take ~30–60s). You
   started it → you stop it at the end.

## 2. Ensure the browser binary

`pnpm exec playwright install chromium` — idempotent, fast when cached. Run it
once before the first capture.

## 3. Capture

From the repo root (so `@playwright/test` resolves):

```bash
node .claude/scripts/screenshot.mjs \
  --url http://localhost:3000/<route> \
  --out <scratchpad>/visual-review/<route-slug> \
  --widths 390,768,1440 --schemes light,dark
```

- Output goes to the session scratchpad, never into the repo.
- The script prints a JSON manifest; `redirected: true` on a capture usually
  means an auth redirect — see step 5.
- Extra widths on request (320 for worst-case mobile, 1920 for wide desktop).

## 4. Read and audit

Read **every** captured PNG with the Read tool, then audit — citing the
specific screenshot (`file`, width, scheme) for each finding:

**Per screenshot**

- One dominant page-level anchor? Competing anchors? (DESIGN.md §1.1)
- State vs action separation — do badges read as facts and buttons as levers? (§1.9)
- Status legible as words + color + position, not color alone (Layer 4)
- Grouping by space/alignment, not border-soup (§1.2)
- Destructive actions visually distinct and spatially separated (§1.5)
- Contrast obviously sufficient; nothing unreadable (WCAG 2.1 AA intent)
- Which output-contract states are visible, and do skeletons match final layout?

**Across breakpoints**

- 390px: horizontal overflow, clipped text, unreachable/overlapping actions,
  content hidden under sticky elements
- 768px: layout actually adapts (not just shrunk desktop)
- Consistent spacing rhythm across widths

**Across schemes**

- Dark mode actually renders dark (identical light/dark pairs → the app forces
  a scheme; note it, don't fail it)
- No hardcoded-light surfaces, unreadable text, or vanished borders in dark

**Against app docs** — when `apps/<app>/docs/design/` exists (from
`/sync-design`), also check tokens: font, radius, spacing scale visibly match
`design-system.md`.

## 5. Auth-protected routes

If captures redirect to a sign-in page: ask the user for a Playwright storage
state file or test credentials, then re-run with `--storage-state <file>`. If
none are available, capture the public states, report the protected routes as
NOT REVIEWED, and never invent or hardcode credentials.

## 6. Report

```
## Visual review: <route>
Captures: <n> (widths × schemes) · dir: <path>

### Findings (severity-ranked)
1. [CRITICAL|MAJOR|MINOR] <finding> — evidence: <file> (<width>px, <scheme>)
   Fix: <concrete change, file:line when known>

### Passed
- <what was checked and clean>

### Not reviewed
- <protected routes, failed captures — with reasons>
```

Findings without visible evidence in a named screenshot are not findings. Stop
any server you started; leave pre-existing servers running.
