"use client";

import { Badge, Box, Checkbox, Group, Stack, Text } from "@peppermint/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { ANALYTICS_COLORS, darkCardStyle } from "../../taskAnalytics.styles";
import type { TaskCategoriesProps } from "./TaskCategories.types";

export function TaskCategories({ categories, activeCategories, onToggle }: TaskCategoriesProps) {
  return (
    <Box style={darkCardStyle()}>
      <Text c={ANALYTICS_COLORS.textPrimary} fw={600} size="sm" mb="md">
        Categories
      </Text>
      <Stack gap="sm">
        {categories.map((cat) => (
          <Group key={cat.id} justify="space-between" wrap="nowrap">
            <Checkbox
              label={cat.label}
              checked={activeCategories.has(cat.id)}
              onChange={() => onToggle(cat.id)}
              styles={{
                label: { color: ANALYTICS_COLORS.textPrimary, fontSize: "var(--mantine-font-size-sm)" },
                input: {
                  backgroundColor: "transparent",
                  borderColor: ANALYTICS_COLORS.textMuted,
                },
              }}
            />
            {cat.count !== undefined && (
              <Badge
                size="sm"
                circle
                styles={{
                  root: {
                    background: ANALYTICS_COLORS.accentPink,
                    color: "white",
                    minWidth: 22,
                    height: 22,
                  },
                }}
              >
                {cat.count}
              </Badge>
            )}
          </Group>
        ))}
      </Stack>
      <Group gap={4} mt="md" style={{ cursor: "pointer" }}>
        <PlusIcon size={14} color={ANALYTICS_COLORS.accentPink} aria-label="Add" />
        <Text size="xs" c={ANALYTICS_COLORS.accentPink} fw={600}>
          Add other
        </Text>
      </Group>
    </Box>
  );
}
