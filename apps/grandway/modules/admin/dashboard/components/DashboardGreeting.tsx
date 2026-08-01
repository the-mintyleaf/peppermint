"use client";

import { Group, Skeleton, Stack, Text, useMounted } from "@peppermint/ui";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { DISPLAY_TRACKING, TYPE_GREETING } from "../dashboard.typeScale";
import type { DashboardGreetingProps } from "./DashboardGreeting.types";

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * The page-level anchor (DESIGN.md §1.1): the one line on the dashboard set at
 * display size. It names the operator, which is the cheapest possible way to
 * confirm WHOSE figures these are — several sections are silently scoped to the
 * caller for a Lead Manager, so "which account am I in" is load-bearing here,
 * not decoration.
 *
 * The time of day is read on the client only. Rendering it during SSR would
 * pick the server's clock and then disagree with the browser's on hydration;
 * until the first client render lands, the line renders as its own skeleton —
 * which it would be doing anyway, since the name comes from `/auth/me/`.
 */
export function DashboardGreeting({ controls }: DashboardGreetingProps) {
  const { user, isLoading } = useCurrentUser();
  // Client-only, and deliberately not on a timer: a greeting that flipped from
  // "afternoon" to "evening" mid-session would be movement with nothing behind
  // it. `useMounted` is false through SSR and the hydrating render, so the
  // server's clock never reaches the DOM to disagree with the browser's.
  const isMounted = useMounted();
  const greeting = isMounted ? greetingFor(new Date().getHours()) : null;

  const isReady = greeting !== null && !isLoading;
  const name = user?.display_name?.trim();

  return (
    <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
      <Stack gap={4} style={{ minWidth: 0 }}>
        {isReady ? (
          <Text {...TYPE_GREETING} style={DISPLAY_TRACKING}>
            {greeting}
            {name ? `, ${name}` : ""}!
          </Text>
        ) : (
          <Skeleton height={34} width={320} radius="sm" />
        )}
        <Text size="sm" c="dimmed">
          Here is what we have for you today.
        </Text>
      </Stack>
      <div style={{ flex: "none" }}>{controls}</div>
    </Group>
  );
}
