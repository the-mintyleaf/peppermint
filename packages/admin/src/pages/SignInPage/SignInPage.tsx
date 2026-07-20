"use client";

import {
  ActionIcon,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@peppermint/ui";
import { MoonIcon, SunIcon } from "@phosphor-icons/react/dist/ssr";

import { useSignInController } from "./SignInPage.hooks";
import { SignInLayoutDefault } from "./components/layouts";
import type { SignInPageProps } from "./SignInPage.types";

/**
 * Sign-in screen. The flow lives in `useSignInController`; this component only
 * resolves the `variant` to a layout and renders the shared colour-scheme toggle.
 */
export function SignInPage(props: SignInPageProps) {
  const controller = useSignInController(props);
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light");
  const isDark = computedColorScheme === "dark";

  return (
    <>
      <SignInLayoutDefault controller={controller} page={props} />

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
