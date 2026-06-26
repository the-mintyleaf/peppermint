"use client";

import { useQuery } from "@tanstack/react-query";
import { Center, Loader, Text, Stack } from "@peppermint/ui";
import { fetchTemplate } from "../../module.api";

interface TemplateViewProps {
  templateId: string;
}

export function TemplateView({ templateId }: TemplateViewProps) {
  const {
    data: template,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["templates", templateId],
    queryFn: () => fetchTemplate(templateId),
  });

  if (isLoading) {
    return (
      <Center h="100%">
        <Loader size="sm" />
      </Center>
    );
  }

  if (error || !template) {
    return (
      <Center h="100%">
        <Text c="dimmed">Template not found.</Text>
      </Center>
    );
  }

  // Render the template HTML as a preview — slots show placeholder values
  const slots = template.slots.reduce<Record<string, string>>((acc, s) => {
    acc[s.name] = s.placeholder ?? `[${s.label}]`;
    return acc;
  }, {});

  // Replace {{slot_name}} with placeholder values in the raw HTML
  let previewHtml = template.html;
  for (const [name, value] of Object.entries(slots)) {
    previewHtml = previewHtml.replaceAll(`{{${name}}}`, value);
  }

  const srcdoc = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9fafb;display:flex;align-items:center;justify-content:center;min-height:100vh;">${previewHtml}</body></html>`;

  return (
    <Stack gap="md" h="100%">
      <Stack gap={2}>
        <Text size="lg" fw={600}>
          {template.name}
        </Text>
        {template.description && (
          <Text size="sm" c="dimmed">
            {template.description}
          </Text>
        )}
      </Stack>
      <iframe
        srcDoc={srcdoc}
        title={`Preview of ${template.name}`}
        style={{
          width: "100%",
          flex: 1,
          border: "1px solid var(--mantine-color-default-border)",
          borderRadius: 8,
          background: "#f9fafb",
        }}
        sandbox="allow-same-origin"
      />
    </Stack>
  );
}
