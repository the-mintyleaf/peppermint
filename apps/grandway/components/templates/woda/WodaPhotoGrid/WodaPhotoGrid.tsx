"use client";

import { Box, SimpleGrid, Text } from "@peppermint/ui";
import { wodaTextProps } from "../wodaProps";
import type { WodaPhotoGridProps } from "./WodaPhotoGrid.types";

/**
 * A blank passport-photo space per person with their name and role beneath.
 * The ward office pastes and stamps the photographs, so the space stays empty.
 */
export function WodaPhotoGrid({ people }: WodaPhotoGridProps) {
  if (people.length === 0) return null;

  return (
    <SimpleGrid cols={Math.min(Math.max(people.length, 3), 4)} spacing="xs">
      {people.map((person, index) => (
        <Box key={`${person.name}-${index}`} ta="center">
          <Box h="40mm" w="32mm" mx="auto" />
          <Text {...wodaTextProps} fw={700} mt="4px">
            {person.name}
          </Text>
          <Text {...wodaTextProps} fw={700}>
            ({person.caption})
          </Text>
        </Box>
      ))}
    </SimpleGrid>
  );
}
