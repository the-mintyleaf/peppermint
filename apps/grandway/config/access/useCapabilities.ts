"use client";

import { useMemo } from "react";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { getCapabilities } from "./capabilities";
import type { Capabilities } from "./capabilities.types";

/**
 * The signed-in account's capabilities.
 *
 * Memoized on `authorityType` alone, so the object is referentially stable across the
 * refetches of `/me` that don't change the tier — consumers can put it straight into
 * a `useMemo` dependency list (`layouts/admin/Admin.tsx` does).
 *
 * While `/me` is in flight every capability is `false`. Route gates handle that via
 * `RequireCapability`'s loading branch; a component reading capabilities inline
 * should render the same thing it would for a denied user, never a flash of the
 * permitted UI.
 */
export function useCapabilities(): Capabilities {
  const { authorityType } = useCurrentUser();
  return useMemo(() => getCapabilities(authorityType), [authorityType]);
}
