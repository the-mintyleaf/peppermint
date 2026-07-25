"use client";

import { Center, Paper, Stack, Text, ThemeIcon } from "@peppermint/ui";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import type { DocumentTemplateProps } from "../../documents.types";

/**
 * Rendered when a document's `template_key` has no matching template in the registry —
 * e.g. a slug the backend accepted (it never validates `template_key`) but that this build
 * doesn't render, including the documented 42-vs-53 catalogue-seed gap
 * (`document_templates/INTEGRATION.md` §9). Prevents a hard crash on `.Template` for an
 * unknown slug; the document's data is safe and still editable via its fields.
 */
export function UnavailableTemplate({ document }: DocumentTemplateProps) {
  return (
    <div style={{ width: "210mm", margin: "0 auto" }}>
      <Paper withBorder p="xl" radius="md">
        <Center mih={200}>
          <Stack align="center" gap="xs" maw={420}>
            <ThemeIcon size={44} radius="xl" color="yellow" variant="light">
              <WarningIcon size={22} weight="fill" aria-hidden />
            </ThemeIcon>
            <Text fw={600} ta="center">
              Template not available
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              This document uses the template{" "}
              <Text span fw={500}>
                {document.templateKey}
              </Text>
              , which isn&apos;t available in this app. Its data is preserved —
              contact an administrator if this template should be installed.
            </Text>
          </Stack>
        </Center>
      </Paper>
    </div>
  );
}
