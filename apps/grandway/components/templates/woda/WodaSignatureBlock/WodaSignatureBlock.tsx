"use client";

import { Box, Group, Text } from "@peppermint/ui";
import { wodaTextProps } from "../wodaProps";
import type { WodaSignatureBlockProps } from "./WodaSignatureBlock.types";

/** Dotted signature line with the signing official's name and post, bottom right. */
export function WodaSignatureBlock({
  values,
  gap = "1in",
}: WodaSignatureBlockProps) {
  const contact = values?.spokesperson_contact;

  return (
    <Group justify="flex-end" mt={gap}>
      <Box w="2.4in" ta="center">
        <Box style={{ borderBottom: "2px dotted black" }} />
        <Text {...wodaTextProps} mt=".04in">
          {String(values?.spokesperson_name ?? "")}
        </Text>
        <Text {...wodaTextProps}>
          {String(values?.spokesperson_post ?? "")}
        </Text>
        {typeof contact === "string" && contact.trim() !== "" && (
          <Text {...wodaTextProps}>Contact No.: {contact}</Text>
        )}
      </Box>
    </Group>
  );
}
