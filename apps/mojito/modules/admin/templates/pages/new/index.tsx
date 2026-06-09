"use client";

import { useEffect } from "react";
import { Paper } from "@zetsel/ui";
import { TemplateBuilder } from "../../form";
import { useBuilderStore } from "../../form/TemplateBuilder.store";
import { PLATFORM_DIMENSIONS } from "../../module.api";

export function TemplatesNew() {
  const { initStore } = useBuilderStore();

  useEffect(() => {
    initStore(
      {
        name: "Untitled Template",
        description: "",
        platform: "instagram_square",
        width: PLATFORM_DIMENSIONS.instagram_square.width,
        height: PLATFORM_DIMENSIONS.instagram_square.height,
      },
      []
    );
  }, [initStore]);

  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)" style={{ overflow: "hidden" }}>
      <TemplateBuilder />
    </Paper>
  );
}
