You are bootstrapping the documentation structure for an app.

Arguments: $ARGUMENTS (app name, e.g. "mintflow" or "mojito")

## Step 1 — Confirm target

If $ARGUMENTS is empty, ask which app to bootstrap. Do not guess.

The target app lives at `apps/$ARGUMENTS/`.

## Step 2 — Create the docs/ tree

Create these folders and files under `apps/$ARGUMENTS/docs/`:

```
docs/
├── design/
│   ├── design-system.md
│   ├── motion-system.md
│   └── DESIGN.md
├── components/
├── modules/
├── utils/
├── patterns/
├── decisions/
└── api-contracts/
```

For `design-system.md`, create with this structure:

```md
# Design System — <App Name>

> Fill this in as design decisions are made. Do not invent tokens — document what is actually used.

## Color tokens
## Typography
## Spacing scale
## Border radius
## Shadows
## Z-index scale
## Layout and breakpoints
## Component rules
## Usage constraints
```

For `motion-system.md`:

```md
# Motion System — <App Name>

> Fill this in as motion decisions are made.

## Philosophy
## Durations
## Easings
## Reusable motion helpers
## Reduced-motion behavior
## Anti-patterns
```

For `DESIGN.md`:

```md
# Design Direction — <App Name>

> Fill this in before starting visual work on the app.

## Visual personality
## Component mood
## Interaction principles
## Layout guidance
## References and examples
```

All other folders (`components/`, `modules/`, `utils/`, `patterns/`, `decisions/`, `api-contracts/`) are created empty. Add a `.gitkeep` file to each so they are tracked by git.

## Step 3 — Update the app AI map

Open `apps/$ARGUMENTS/docs/AI.md` and update the design docs location entry to point to `docs/design/` (removing any "pending" note).

## Step 4 — Report

Respond with the files created and a reminder that the design docs are scaffolded with placeholders — fill them in before starting visual work on the app.
