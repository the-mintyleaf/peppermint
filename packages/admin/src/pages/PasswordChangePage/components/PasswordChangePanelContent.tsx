"use client";

import { CheckCircleIcon, WarningIcon } from "@phosphor-icons/react/dist/ssr";

import { Alert, Loader, Stack, Text } from "@peppermint/ui";

import { PasswordChangeForm } from "./PasswordChangeForm";
import type { PasswordChangeLayoutProps } from "../PasswordChangePage.types";

/**
 * The interactive body of the change-password screen — page-level error alert
 * plus whichever of the form / confirmation states the current phase calls for.
 * Shared by every layout variant; the surrounding chrome and the heading block
 * belong to the layout.
 */
export function PasswordChangePanelContent({
  controller,
  page,
}: PasswordChangeLayoutProps) {
  const { phase, errorMessage } = controller;
  const isDone = phase !== "form";

  return (
    <Stack gap="xs" py="md">
      {/*
       * Mounted in every phase, and empty until there is something to say. A
       * live region inserted with its text already inside is frequently missed
       * by NVDA and JAWS — the region has to pre-exist in the accessibility
       * tree for the *change* to be what gets announced. Since the form that
       * held focus is unmounted on success, this is the only thing that tells a
       * screen-reader user the change landed.
       */}
      <Stack gap="sm" align="center" role="status" aria-live="polite">
        {isDone && (
          <>
            {phase === "redirecting" ? (
              <Loader type="dots" size="sm" color="brand.5" />
            ) : (
              <CheckCircleIcon
                size={32}
                weight="duotone"
                color="var(--mantine-color-teal-6)"
                aria-hidden
              />
            )}

            <Text c="dimmed" size="sm" ta="center" maw={320}>
              {phase === "redirecting"
                ? "Password updated. Taking you back in a moment…"
                : `Password updated. Use it the next time you sign in to ${page.brand[0]}.`}
            </Text>
          </>
        )}
      </Stack>

      {!isDone && (
        <>
          {errorMessage && (
            // The alert mounts after a failed submit while focus stays in the
            // form, so it needs a live region to reach a screen reader at all.
            // Field-level failures never reach here — they render against their
            // own input.
            <Alert
              role="alert"
              aria-live="assertive"
              color="red"
              icon={<WarningIcon size={18} weight="fill" aria-hidden />}
            >
              {errorMessage}
            </Alert>
          )}

          <PasswordChangeForm controller={controller} />
        </>
      )}
    </Stack>
  );
}
