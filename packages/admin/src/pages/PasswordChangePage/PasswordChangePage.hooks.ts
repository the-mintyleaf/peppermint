"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "@peppermint/ui";

import { ACCESS_TOKEN_KEY } from "../../auth/authStorage";
import { DEFAULT_MIN_PASSWORD_LENGTH } from "./utils/resolvePasswordChangePageProps";
import type {
  PasswordChangeController,
  PasswordChangeFormValues,
  PasswordChangePageProps,
  PasswordChangePhase,
} from "./PasswordChangePage.types";

interface PasswordChangeErrorBody {
  /** House envelope flag — `false` means failure even under a 2xx status. */
  success?: boolean;
  error?: { code?: string; message?: string };
  message?: string;
}

/** Carries the parsed error body from a failed change-password request. */
class PasswordChangeRequestError extends Error {
  body: PasswordChangeErrorBody;
  /** Field the message belongs against, or `null` for a page-level error. */
  field: keyof PasswordChangeFormValues | null;

  constructor(
    message: string,
    body: PasswordChangeErrorBody,
    field: keyof PasswordChangeFormValues | null,
  ) {
    super(message);
    this.name = "PasswordChangeRequestError";
    this.body = body;
    this.field = field;
  }
}

/** Built-in copy for the codes this flow can produce; overridable per app. */
const DEFAULT_ERROR_MESSAGES: Record<string, string> = {
  AUTH_PASSWORD_INVALID: "Your current password is incorrect.",
  AUTH_PASSWORD_REUSE_BLOCKED:
    "You've used this password recently. Choose a different one.",
  VALIDATION_ERROR: "That password does not meet the requirements.",
};

/**
 * Which field a failure belongs against. Anything not listed is a page-level
 * error — surfacing it on a field would blame the wrong input.
 */
const ERROR_FIELDS: Record<string, keyof PasswordChangeFormValues> = {
  AUTH_PASSWORD_INVALID: "old_password",
  AUTH_PASSWORD_REUSE_BLOCKED: "new_password",
  VALIDATION_ERROR: "new_password",
};

/** Picks the most specific message available for a failed response body. */
function resolveErrorMessage(
  body: PasswordChangeErrorBody,
  errorMessageMap?: Record<string, string>,
): string {
  const code = body.error?.code;
  if (code && errorMessageMap?.[code]) return errorMessageMap[code];
  if (code && DEFAULT_ERROR_MESSAGES[code]) return DEFAULT_ERROR_MESSAGES[code];
  return (
    body.error?.message ?? body.message ?? "Failed to update your password."
  );
}

/**
 * Owns the entire change-password flow — the form, the mutation, phases and the
 * post-success redirect — so the layout variants stay purely presentational.
 */
export function usePasswordChangeController({
  changePasswordApi,
  minPasswordLength = DEFAULT_MIN_PASSWORD_LENGTH,
  successRedirectUrl,
  onSuccess,
  onError,
  withCredentials = false,
  errorMessageMap,
}: PasswordChangePageProps): PasswordChangeController {
  const [phase, setPhase] = useState<PasswordChangePhase>("form");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    },
    [],
  );

  const form = useForm<PasswordChangeFormValues>({
    initialValues: { old_password: "", new_password: "", confirm_password: "" },
    validate: {
      old_password: (value) => (!value ? "Current password is required" : null),
      new_password: (value) =>
        value.length < minPasswordLength
          ? `Password must be at least ${minPasswordLength} characters`
          : null,
      confirm_password: (value, values) =>
        value !== values.new_password ? "Passwords do not match" : null,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: PasswordChangeFormValues) => {
      const token =
        typeof window !== "undefined"
          ? window.localStorage.getItem(ACCESS_TOKEN_KEY)
          : null;

      const response = await fetch(changePasswordApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: withCredentials ? "include" : "same-origin",
        body: JSON.stringify({
          old_password: values.old_password,
          new_password: values.new_password,
        }),
      });

      // A backend can respond without a JSON body at all (a 502 from a proxy, a
      // 204 on success); an absent or unparseable body must never surface as an
      // opaque SyntaxError.
      const body = (await response
        .json()
        .catch(() => null)) as PasswordChangeErrorBody | null;

      // `success: false` inside a 200 is the house envelope reporting an
      // application-level failure. Treating the status code alone as the verdict
      // would show "Password updated." and redirect on an unchanged password.
      const failed = !response.ok || body?.success === false;
      if (failed) {
        const code = body?.error?.code;
        throw new PasswordChangeRequestError(
          resolveErrorMessage(body ?? {}, errorMessageMap),
          body ?? {},
          code ? (ERROR_FIELDS[code] ?? null) : null,
        );
      }
    },
    onSuccess: () => {
      onSuccess?.();
      if (!successRedirectUrl) {
        setPhase("success");
        return;
      }
      setPhase("redirecting");
      // Tracked so unmounting cancels it. Without that, a user who navigates
      // away inside the 1.5s window gets yanked back to the redirect target
      // from whatever page they had reached.
      redirectTimer.current = setTimeout(() => {
        window.location.href = successRedirectUrl;
      }, 1500);
    },
    onError: (error: unknown) => {
      if (!(error instanceof PasswordChangeRequestError)) {
        setErrorMessage("Something went wrong. Please try again.");
        onError?.(error);
        return;
      }

      onError?.(error.body);
      if (error.field) {
        form.setFieldError(error.field, error.message);
      } else {
        setErrorMessage(error.message);
      }
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    setErrorMessage(null);
    mutation.mutate(values);
  });

  return {
    form,
    phase,
    errorMessage,
    isLoading: mutation.isPending,
    minPasswordLength,
    onSubmit: handleSubmit,
  };
}
