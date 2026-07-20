"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react/dist/ssr";

import {
  ActionIcon,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@peppermint/ui";

import { usePasswordChangeController } from "./PasswordChangePage.hooks";
import {
  PasswordChangeLayoutDefault,
  PasswordChangeLayoutModernLines,
} from "./components";
import { resolvePasswordChangePageProps } from "./utils/resolvePasswordChangePageProps";
import type { PasswordChangePageProps } from "./PasswordChangePage.types";

/**
 * Change-password screen. The flow lives in `usePasswordChangeController`; this
 * component only resolves presentational defaults, picks a layout from
 * `variant`, and renders the colour-scheme toggle that both variants share.
 */
export function PasswordChangePage(props: PasswordChangePageProps) {
  const controller = usePasswordChangeController(props);
  const page = resolvePasswordChangePageProps(props);
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light");
  const isDark = computedColorScheme === "dark";

  const Layout =
    props.variant === "modernlines"
      ? PasswordChangeLayoutModernLines
      : PasswordChangeLayoutDefault;

  return (
    <>
      <Layout controller={controller} page={page} />

      <Tooltip label={isDark ? "Light mode" : "Dark mode"} withArrow>
        <ActionIcon
          variant="default"
          size="lg"
          radius="xl"
          pos="fixed"
          bottom="1.25rem"
          right="1.25rem"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => setColorScheme(isDark ? "light" : "dark")}
        >
          {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </ActionIcon>
      </Tooltip>
    </>
  );
}
