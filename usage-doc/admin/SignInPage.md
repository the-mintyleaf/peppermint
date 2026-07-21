# SignInPage

Full-page sign-in screen for a Peppermint app. Owns the whole credential flow —
login, MFA challenge, magic link, forced-password-change hand-off, token storage
and redirect — so an app module only supplies copy, endpoints and callbacks.

```tsx
import { SignInPage } from "@peppermint/admin";
```

## Variants

The `variant` prop picks the page chrome. The flow, the forms and every prop
below behave identically in both.

| Variant         | Look                                                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"default"`     | Brand-gradient (or image-backed) panel on the left, centred form card on the right. This is the default when `variant` is omitted.                       |
| `"modernlines"` | One bordered frame divided by 1px rules into a top rail, brand/form columns and a status rail, with corner brackets around the form and square controls. |

`modernlines` draws every colour from Mantine theme tokens, so it follows the
host app's palette and its light/dark toggle rather than imposing its own.

```tsx
<SignInPage
  variant="modernlines"
  heading={["Sign into", "mintflow."]}
  brand={["mintflow", "by mintyleaf.co"]}
  loginApi={`${API_URL}/api/v1/auth/login/`}
  successRedirectUrl="/dashboard"
/>
```

## Props

### Required

| Prop                 | Type     | Description                                      |
| -------------------- | -------- | ------------------------------------------------ |
| `loginApi`           | `string` | Endpoint the credentials are POSTed to.          |
| `successRedirectUrl` | `string` | Where to send the user once a session is stored. |

### Appearance

| Prop                   | Type                         | Default                                                | Description                                                                               |
| ---------------------- | ---------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `variant`              | `"default" \| "modernlines"` | `"default"`                                            | Page chrome. See above.                                                                   |
| `heading`              | `[string, string]`           | `["Sign into", "to your portal."]`                     | Form heading; the second element renders in the brand colour.                             |
| `subheading`           | `string`                     | `"Enter your credentials to access your account."`     | Supporting line under the heading.                                                        |
| `brand`                | `[string, string]`           | `["Portal", "by Peppermint"]`                          | Brand mark; the second element renders dimmed.                                            |
| `panelTagline`         | `string`                     | `"Work done right."`                                   | Short line above the brand-panel headline.                                                |
| `panelHeading`         | `string`                     | `"Sketched from the ground up to make the work work."` | The brand panel's large headline.                                                         |
| `panelBackgroundImage` | `string`                     | —                                                      | Background image for the brand panel. Always dimmed 50% so the text on top stays legible. |

### Credentials

| Prop                  | Type                                    | Default                                               | Description                                                                                                                                                                                            |
| --------------------- | --------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `identifierField`     | `"email" \| "username" \| "identifier"` | `"email"`, or `"username"` when `skipEmailValidation` | The key the credential is submitted under. `"username"` and `"identifier"` both send **both** keys (mirrored) so either backend naming resolves; `"email"` sends `email` only.                         |
| `skipEmailValidation` | `boolean`                               | `false`                                               | Drops the email-format check and flips the default `identifierField`.                                                                                                                                  |
| `withCredentials`     | `boolean`                               | `false`                                               | Send cookies with the login/MFA fetch, for cookie-session backends. Leave off for token-in-body backends whose login endpoint uses wildcard CORS — the browser rejects credentialed requests to those. |
| `errorMessageMap`     | `Record<string, string>`                | —                                                     | `error.code` → message overrides. Falls back to the backend's own message.                                                                                                                             |

### MFA and password change

| Prop                       | Type                               | Description                                                                                                                                                                                                                                                                                              |
| -------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mfaVerifyApi`             | `string`                           | Endpoint for `{ challenge_id, code }`. When set, a `{ mfa_required: true, challenge_id }` login response switches the page to an MFA code screen. When unset, such a response is treated as a misconfiguration error.                                                                                    |
| `onMfaSetupRecommended`    | `() => void`                       | Called on a non-MFA success whose response set `mfa_setup_recommended: true`.                                                                                                                                                                                                                            |
| `onPasswordChangeRequired` | `(data: SignInResultData) => void` | Called for a first-login challenge (`password_change_required: true` or `next_action: "first_login_password_change"`) that carries no session. The page stops — no token error, no redirect — and hands you the full response, typically to stash `challenge_token` and route to a password-change page. |

### Social and magic link

| Prop                                                                         | Type                               | Default | Description                                                           |
| ---------------------------------------------------------------------------- | ---------------------------------- | ------- | --------------------------------------------------------------------- |
| `hasGoogleLogin` · `hasAppleLogin` · `hasDiscordLogin` · `hasMagicLinkLogin` | `boolean`                          | `false` | Show the matching button. The row appears only if at least one is on. |
| `onGoogleLogin` · `onAppleLogin` · `onDiscordLogin`                          | `() => void`                       | —       | Click handlers for the social buttons.                                |
| `onMagicLinkLogin`                                                           | `(email: string) => Promise<void>` | —       | Called with the entered address from the magic-link form.             |

### Callbacks and links

| Prop                    | Type                               | Default | Description                                              |
| ----------------------- | ---------------------------------- | ------- | -------------------------------------------------------- |
| `onSuccess`             | `(data: SignInResultData) => void` | —       | Fires after tokens are stored, before the redirect.      |
| `onError`               | `(error: unknown) => void`         | —       | Fires with the parsed response body or the thrown error. |
| `onForgotPassword`      | `() => void`                       | —       | Click handler for the forgot-password link.              |
| `disableSignUp`         | `boolean`                          | `false` | Hide the "No account? Sign up" line.                     |
| `disableForgotPassword` | `boolean`                          | `false` | Hide the forgot-password link.                           |

## Response handling

The page unwraps the `{ success, data }` envelope and reads the access token
from `access`, `accessToken` or `access_token` (refresh from `refresh` or
`refreshToken`). It redirects **only** once a token is actually in hand — a 200
with an unexpected body surfaces an error instead of bouncing the user into an
unauthenticated session.

## Exported types

`SignInPageProps` · `SignInIdentifierField` · `SignInVariant`
