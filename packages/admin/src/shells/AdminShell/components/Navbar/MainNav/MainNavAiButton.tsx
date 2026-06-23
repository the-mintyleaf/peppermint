"use client";

import type { MouseEvent } from "react";
import { Tooltip, UnstyledButton, useComputedColorScheme } from "@peppermint/ui";
import { OpenAIIcon } from "./OpenAIIcon";
import type { AdminShellAiButton } from "../../../AdminShell.types";
import { OpenAiLogoIcon as OpenAiLogo } from "@phosphor-icons/react/dist/csr/OpenAiLogo";

export const DEFAULT_AI_BUTTON_HREF = "/admin/ai-chat";
export const DEFAULT_AI_BUTTON_LABEL = "AI Assistant";

interface MainNavAiButtonProps {
  aiButton?: AdminShellAiButton;
  pathname?: string;
}

export function MainNavAiButton({
  aiButton,
  pathname = "",
}: MainNavAiButtonProps) {
  const colorScheme = useComputedColorScheme("dark");
  const isDark = colorScheme === "dark";

  if (aiButton?.hidden) return null;

  const href = aiButton?.href ?? DEFAULT_AI_BUTTON_HREF;
  const label = aiButton?.label ?? DEFAULT_AI_BUTTON_LABEL;
  const isActive = pathname === href || pathname.startsWith(href + "/");

  const activeBg = isDark ? "var(--mantine-color-dark-5)" : "var(--mantine-color-gray-2)";

  const button = (
    <UnstyledButton
      mb="sm"
      component={aiButton?.onClick ? "button" : "a"}
      href={aiButton?.onClick ? undefined : href}
      onClick={(event: MouseEvent) => {
        aiButton?.onClick?.();
        if (aiButton?.onClick) event.preventDefault();
      }}
      aria-label={label}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        backgroundColor: isActive ? activeBg : "transparent",
        transition: "background-color 150ms ease",
      }}
    >
      <OpenAiLogo size={20} weight="bold" color="var(--mantine-color-brand-3)" />
    </UnstyledButton>
  );

  return (
    <Tooltip label={label} position="right" withArrow>
      {button}
    </Tooltip>
  );
}
