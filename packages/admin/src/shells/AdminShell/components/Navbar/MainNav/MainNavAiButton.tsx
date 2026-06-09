"use client";

import type { MouseEvent } from "react";
import { Tooltip, UnstyledButton } from "@zetsel/ui";
import type { Icon } from "@phosphor-icons/react";
import type { AdminShellAiButton } from "../../../AdminShell.types";

export const DEFAULT_AI_BUTTON_HREF = "/admin/ai-chat";
export const DEFAULT_AI_BUTTON_LABEL = "AI Assistant";
export const DEFAULT_AI_BUTTON_COLOR = "pink";

interface MainNavAiButtonProps {
  brandIcon: Icon;
  aiButton?: AdminShellAiButton;
  pathname?: string;
}

export function MainNavAiButton({
  brandIcon,
  aiButton,
  pathname = "",
}: MainNavAiButtonProps) {
  if (aiButton?.hidden) return null;

  const href = aiButton?.href ?? DEFAULT_AI_BUTTON_HREF;
  const label = aiButton?.label ?? DEFAULT_AI_BUTTON_LABEL;
  const color = aiButton?.color ?? DEFAULT_AI_BUTTON_COLOR;
  const IconComponent = aiButton?.icon ?? brandIcon;
  const isActive =
    pathname === href || pathname.startsWith(href + "/");

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
        borderRadius: "var(--mantine-radius-md)",
        backgroundColor: isActive
          ? `var(--mantine-color-${color}-8)`
          : `var(--mantine-color-${color}-9)`,
        transition: "background-color 150ms ease, color 150ms ease",
      }}
    >
      <IconComponent size={20} weight={isActive ? "fill" : "fill"} />
    </UnstyledButton>
  );

  return (
    <Tooltip label={label} position="right" withArrow>
      {button}
    </Tooltip>
  );
}
