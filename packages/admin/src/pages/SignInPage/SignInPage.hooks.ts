"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { storeAuthTokens } from "../../auth/authStorage";
import { unwrapEnvelope } from "./utils/unwrapEnvelope";
import type {
  SignInController,
  SignInIdentifierField,
  SignInPageProps,
  SignInPhase,
  SignInResultData,
} from "./SignInPage.types";

/** Carries the parsed response body alongside a resolved, user-facing message. */
class SignInRequestError extends Error {
  body: unknown;
  constructor(message: string, body: unknown) {
    super(message);
    this.name = "SignInRequestError";
    this.body = body;
  }
}

/** Picks the most specific message available for a failed response body. */
function resolveErrorMessage(
  body: unknown,
  errorMessageMap?: Record<string, string>,
): string {
  const data = (body ?? {}) as SignInResultData;
  const code = data.error?.code;
  if (code && errorMessageMap?.[code]) return errorMessageMap[code];
  return (
    data.error?.message ??
    data.message ??
    "Something went wrong. Please try again."
  );
}

/**
 * POSTs a JSON body and unwraps the `{ success, data }` envelope; throws a
 * SignInRequestError (carrying the parsed body) on a non-2xx so the mutation's
 * onError path can surface a resolved message.
 */
async function postAuth(
  url: string,
  payload: Record<string, unknown>,
  options: {
    withCredentials: boolean;
    errorMessageMap?: Record<string, string>;
  },
): Promise<SignInResultData> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    // Opt-in credentials so cookie-based backends can set their session cookies
    // (HttpOnly refresh + CSRF) on login. Off by default: a credentialed request
    // to a wildcard-CORS login endpoint would be rejected by the browser.
    credentials: options.withCredentials ? "include" : "same-origin",
  });
  const body = await response.json();
  if (!response.ok) {
    throw new SignInRequestError(
      resolveErrorMessage(body, options.errorMessageMap),
      body,
    );
  }
  return unwrapEnvelope(body) as SignInResultData;
}

/**
 * Owns the entire sign-in flow — phases, both mutations, token storage and the
 * submit handlers — so the layout variants stay purely presentational.
 */
export function useSignInController({
  loginApi,
  identifierField,
  skipEmailValidation = false,
  successRedirectUrl,
  onSuccess,
  onError,
  onMagicLinkLogin,
  mfaVerifyApi,
  onMfaSetupRecommended,
  onPasswordChangeRequired,
  withCredentials = false,
  errorMessageMap,
}: SignInPageProps): SignInController {
  const resolvedIdentifierField: SignInIdentifierField =
    identifierField ?? (skipEmailValidation ? "username" : "email");

  const [showMagicLink, setShowMagicLink] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [phase, setPhase] = useState<SignInPhase>("credentials");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestOptions = { withCredentials, errorMessageMap };

  const completeSuccess = (data: SignInResultData) => {
    // A first-login challenge (no session) short-circuits into the caller's
    // forced-password-change flow instead of the "no access token" error below.
    const isPasswordChangeChallenge =
      data.password_change_required === true ||
      data.next_action === "first_login_password_change";
    if (isPasswordChangeChallenge) {
      if (onPasswordChangeRequired) {
        onPasswordChangeRequired(data);
      } else {
        // No handler wired — surface an accurate message rather than the generic
        // "no access token" error, which would misrepresent this state.
        setErrorMessage(
          "A password change is required before you can sign in.",
        );
        onError?.(data);
      }
      return;
    }

    const accessToken = data.access ?? data.accessToken ?? data.access_token;
    const refreshToken = data.refresh ?? data.refreshToken;

    // Only advance into the app once we actually hold an access token — a 200 with
    // an unexpected body must not redirect into an unauthenticated session (which
    // would bounce straight back to sign-in).
    if (!accessToken) {
      setErrorMessage("Signed in, but no access token was returned.");
      onError?.(data);
      return;
    }

    storeAuthTokens(accessToken, refreshToken);
    setPhase("redirecting");
    onSuccess?.(data);
    if (data.mfa_setup_recommended) onMfaSetupRecommended?.();

    setTimeout(() => {
      window.location.href = successRedirectUrl;
    }, 1000);
  };

  const handleSuccessData = (data: SignInResultData) => {
    if (data.mfa_required) {
      if (!mfaVerifyApi) {
        setErrorMessage(
          "Multi-factor authentication is required but not configured.",
        );
        onError?.(data);
        return;
      }
      setChallengeId(data.challenge_id ?? null);
      setPhase("mfa");
      return;
    }
    completeSuccess(data);
  };

  const handleMutationError = (error: unknown) => {
    setErrorMessage(
      error instanceof SignInRequestError
        ? error.message
        : "Something went wrong. Please try again.",
    );
    onError?.(error instanceof SignInRequestError ? error.body : error);
  };

  const loginMutation = useMutation({
    mutationFn: (vars: { identifier: string; password: string }) =>
      postAuth(
        loginApi,
        {
          [resolvedIdentifierField]: vars.identifier,
          password: vars.password,
        },
        requestOptions,
      ),
    onSuccess: handleSuccessData,
    onError: handleMutationError,
  });

  const mfaMutation = useMutation({
    mutationFn: (code: string) => {
      // Guarded rather than cast: the phase transitions already refuse to reach
      // here without an endpoint, but nothing in the types enforced that, and a
      // fetch on `undefined` would surface as an opaque 404.
      if (!mfaVerifyApi) {
        throw new Error(
          "Multi-factor authentication is required but not configured.",
        );
      }
      return postAuth(
        mfaVerifyApi,
        { challenge_id: challengeId, code },
        requestOptions,
      );
    },
    onSuccess: completeSuccess,
    onError: handleMutationError,
  });

  const handleSignIn = (identifier: string, password: string) => {
    setErrorMessage(null);
    loginMutation.mutate({ identifier, password });
  };

  const handleMfaSubmit = (code: string) => {
    if (!mfaVerifyApi) return;
    setErrorMessage(null);
    mfaMutation.mutate(code);
  };

  const handleBackToSignIn = () => {
    setPhase("credentials");
    setChallengeId(null);
    setErrorMessage(null);
  };

  const handleSocialLogin = (callback?: () => void) => {
    callback?.();
  };

  const handleMagicLinkSubmit = async (): Promise<void> => {
    if (!magicLinkEmail.trim()) {
      return;
    }

    try {
      await Promise.resolve(onMagicLinkLogin?.(magicLinkEmail));
      setMagicLinkEmail("");
    } catch (error: unknown) {
      console.error("Magic link error:", error);
    }
  };

  return {
    phase,
    errorMessage,
    isLoading: loginMutation.isPending || mfaMutation.isPending,
    identifierField: resolvedIdentifierField,
    showMagicLink,
    setShowMagicLink,
    magicLinkEmail,
    setMagicLinkEmail,
    onSignIn: handleSignIn,
    onMfaSubmit: handleMfaSubmit,
    onBackToSignIn: handleBackToSignIn,
    onMagicLinkSubmit: handleMagicLinkSubmit,
    onSocialLogin: handleSocialLogin,
  };
}
