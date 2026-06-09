"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Paper, Center, Loader } from "@zetsel/ui";
import { useQuery } from "@tanstack/react-query";
import { TemplateBuilder } from "../../form";
import { useBuilderStore } from "../../form/TemplateBuilder.store";
import { fetchTemplate } from "../../module.api";
import type { SlotElement } from "../../form/templateForm.types";

export function TemplatesEdit() {
  const { id } = useParams<{ id: string }>();
  const { initStore } = useBuilderStore();

  const { data: template, isLoading } = useQuery({
    queryKey: ["templates", id],
    queryFn: () => fetchTemplate(id),
  });

  useEffect(() => {
    if (!template) return;
    // Convert slots back to CanvasElement[] — simplified: create one slot element per slot
    const elements: SlotElement[] = template.slots.map((slot, i) => ({
      id: `slot_${i}`,
      kind: "slot" as const,
      x: 80,
      y: 200 + i * 100,
      width: 600,
      height: 80,
      slotName: slot.name,
      slotType: slot.type,
      label: slot.label,
      required: slot.required,
      placeholder: slot.placeholder,
      maxChars: slot.maxChars,
    }));

    initStore(
      {
        name: template.name,
        description: template.description ?? "",
        platform: template.platform,
        width: template.width,
        height: template.height,
      },
      elements
    );
  }, [template, initStore]);

  if (isLoading) {
    return (
      <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
        <Center h="100%">
          <Loader size="sm" />
        </Center>
      </Paper>
    );
  }

  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)" style={{ overflow: "hidden" }}>
      <TemplateBuilder templateId={id} />
    </Paper>
  );
}
