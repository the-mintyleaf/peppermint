# PasswordChangePage

Full-page change-password screen for a Peppermint app. Owns the whole flow — the
three-field form, strength guidance, the request, field-level vs page-level error
placement, the confirmation state and the redirect — so an app module only
supplies copy, the endpoint and callbacks.

```tsx
import { PasswordChangePage } from "@peppermint/admin";
```

It is the natural landing page for `SignInPage`'s `onPasswordChangeRequired`
hand-off, and works equally as a standalone "change my password" route.

## Variants

The `variant` prop picks the page chrome, exactly as on `SignInPage`. The flow,
the form and every prop below behave identically in both.

| Variant         | Look                                                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"default"`     | Brand-gradient (or image-backed) panel on the left, centred form card on the right. This is the default when `variant` is omitted.                       |
| `"modernlines"` | One bordered frame divided by 1px rules into a top rail, brand/form columns and a status rail, with corner brackets around the form and square controls. |

`modernlines` draws every colour from Mantine theme tokens, so it follows the
host app's palette and its light/dark toggle rather than imposing its own. Pair
it with `<SignInPage variant="modernlines" />` so both auth screens match.

```tsx
<PasswordChangePage
  variant="modernlines"
  heading={["Change your", "password."]}
  brand={["mintflow", "by mintyleaf.co"]}
  changePasswordApi={`${API_URL}/api/v1/auth/change-password/`}
  successRedirectUrl="/dashboard"
/>
```

## Props

### Required

| Prop                | Type     | Description                                                     |
| ------------------- | -------- | --------------------------------------------------------------- |
| `changePasswordApi` | `string` | Endpoint receiving `{ old_password, new_password }` via `POST`. |

### Appearance

| Prop                   | Type                         | Default                                                                         | Description                                                           |
| ---------------------- | ---------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `variant`              | `"default" \| "modernlines"` | `"default"`                                                                     | Page chrome. See above.                                               |
| `heading`              | `[string, string]`           | `["Change your", "password."]`                                                  | Form heading; the second element renders in the brand colour.         |
| `subheading`           | `string`                     | `"Enter your current password, then choose a new one you haven't used before."` | Supporting line, shown only while the form is on screen.              |
| `brand`                | `[string, string]`           | `["Portal", "by Peppermint"]`                                                   | Brand mark; the second element renders dimmed.                        |
| `panelTagline`         | `string`                     | `"Account security."`                                                           | Small marker at the top of the brand panel.                           |
| `panelHeading`         | `string`                     | `"A new password is all that stands in the way."`                               | Large statement in the brand panel.                                   |
| `panelBackgroundImage` | `string`                     | —                                                                               | Replaces the panel gradient. Always dimmed 50% so text stays legible. |

### Behaviour

| Prop                 | Type                       | Default | Description                                                                                                                                                             |
| -------------------- | -------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `minPasswordLength`  | `number`                   | `12`    | Length enforced on submit and shown in the checklist. **Must match the backend's rule** — lowering it here only moves the rejection from the field to a failed request. |
| `successRedirectUrl` | `string`                   | —       | Where to go after success. Omit to stay on the confirmation state.                                                                                                      |
| `onSuccess`          | `() => void`               | —       | Fired once the change is accepted, before any redirect.                                                                                                                 |
| `onError`            | `(error: unknown) => void` | —       | Receives the parsed error body (or the raw error for network/parse failures).                                                                                           |
| `withCredentials`    | `boolean`                  | `false` | Send cookies with the request, for cookie-session backends. Token backends need no change — the stored access token is attached as a bearer header.                     |
| `errorMessageMap`    | `Record<string, string>`   | —       | Error-code → copy overrides. Falls back to the page's own defaults, then to the backend's `error.message` / `message`.                                                  |

## Errors

Failures land where the user can act on them:

| Code                                | Placement                       |
| ----------------------------------- | ------------------------------- |
| `AUTH_PASSWORD_INVALID`             | Under **Current password**      |
| `AUTH_PASSWORD_REUSE_BLOCKED`       | Under **New password**          |
| `VALIDATION_ERROR`                  | Under **New password**          |
| Anything else, and network failures | Page-level alert above the form |

Supply `errorMessageMap` to override the copy per code; placement is fixed.

## States

| State                                    | Rendering                                                                                                                  |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Empty                                    | Blank form, meter at zero with the full checklist unmet.                                                                   |
| Pending                                  | Inputs disabled, submit button in its loading state.                                                                       |
| Request failed                           | Field-level error, or a page-level `role="alert"` alert. The form stays filled and resubmittable — that is the retry path. |
| Success                                  | Check icon + "Password updated." in a `role="status"` region.                                                              |
| Success with redirect                    | Same, with a loader and "Taking you back in a moment…", then navigates after 1.5s.                                         |
| Permission denied                        | N/A — an unauthenticated caller gets the backend's error through the page-level alert.                                     |
| Read-only / archived / conflicting edits | N/A — the page owns one action against the current user's own credential.                                                  |
| Unsaved changes                          | N/A — the page has no in-app navigation to leave by; nothing to warn against.                                              |

## Notes

- The page reads the access token from `localStorage` (`access_token`) and sends
  it as a bearer header, matching `SignInPage`'s token storage.
- Only the length rule blocks submission. The character-variety checks raise the
  strength score and are rendered as guidance, never as errors.
- The colour-scheme toggle in the bottom-right is built in, as on `SignInPage`.
