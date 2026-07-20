"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react/dist/ssr";

import {
  ActionIcon,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@peppermint/ui";

import { useSignInController } from "./SignInPage.hooks";
import { SignInLayoutDefault, SignInLayoutModernLines } from "./components";
import { resolveSignInPageProps } from "./utils/resolveSignInPageProps";
import type { SignInPageProps } from "./SignInPage.types";

/**
 * Sign-in screen. The flow lives in `useSignInController`; this component only
 * resolves presentational defaults, picks a layout from `variant`, and renders
 * the colour-scheme toggle that both variants share.
 */
export function SignInPage(props: SignInPageProps) {
  const controller = useSignInController(props);
  const page = resolveSignInPageProps(props);
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light");
  const isDark = computedColorScheme === "dark";

  const Layout =
    props.variant === "modernlines"
      ? SignInLayoutModernLines
      : SignInLayoutDefault;

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
