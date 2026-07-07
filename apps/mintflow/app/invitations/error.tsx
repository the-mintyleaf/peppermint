"use client";

import { InvitationsError } from "@/modules/invitations/components/InvitationsError";

export default function InvitationsRouteError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <InvitationsError onRetry={reset} />;
}
