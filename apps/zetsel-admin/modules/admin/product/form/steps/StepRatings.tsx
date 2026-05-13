"use client";

import { useFormInstance } from "@zetsel/admin";
import {
  ActionIcon,
  Button,
  Grid,
  Group,
  NumberInput,
  Rating,
  Stack,
  Text,
  TextInput,
} from "@zetsel/ui";
import { MinusCircleIcon, PlusCircleIcon } from "@phosphor-icons/react";
import type { ProductFormValues } from "../productForm.types";

export function StepRatings() {
  const { form } = useFormInstance<ProductFormValues>();

  const ratingEmojis = form.getValues().ratingEmojis;
  const ratingBreakdown = form.getValues().ratingBreakdown;

  const addEmoji = () => form.insertListItem("ratingEmojis", "");
  const removeEmoji = (i: number) => form.removeListItem("ratingEmojis", i);

  const addBreakdown = () =>
    form.insertListItem("ratingBreakdown", { category: "", value: 3 });
  const removeBreakdown = (i: number) =>
    form.removeListItem("ratingBreakdown", i);

  return (
    <Stack gap="lg">
      <div>
        <Text size="sm" fw={600} mb={4}>
          Ratings & Audience
        </Text>
        <Text size="xs" c="dimmed">
          All fields here are editorial — they control how the product is
          positioned for buyers, not hard purchase data. Rating and review count
          can be seeded or left at 0 for new products.
        </Text>
      </div>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Stack gap={4}>
            <Text size="sm" fw={500}>
              Overall Rating
            </Text>
            <Rating
              fractions={2}
              value={form.getValues().rating}
              onChange={(v) => form.setFieldValue("rating", v)}
            />
            {form.errors.rating && (
              <Text size="xs" c="red">
                {form.errors.rating}
              </Text>
            )}
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6 }}>
          <NumberInput
            label="Review Count"
            description="Total number of reviews"
            min={0}
            {...form.getInputProps("reviewCount")}
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <TextInput
            label="Rating Audience"
            description='Who is this product best for? e.g. "for audience that needs powerful graphics"'
            placeholder="for audience that needs powerful graphics"
            {...form.getInputProps("ratingAudience")}
          />
        </Grid.Col>
      </Grid>

      <Stack gap="xs">
        <Group justify="space-between">
          <div>
            <Text size="sm" fw={600}>
              Rating Emojis
            </Text>
            <Text size="xs" c="dimmed">
              Decorative emojis shown alongside the audience label.
            </Text>
          </div>
          <Button
            size="xs"
            variant="light"
            leftSection={<PlusCircleIcon size={14} />}
            onClick={addEmoji}
          >
            Add emoji
          </Button>
        </Group>

        {ratingEmojis.map((_, i) => (
          <Group key={i} gap="xs">
            <TextInput
              style={{ flex: 1 }}
              placeholder="👾"
              {...form.getInputProps(`ratingEmojis.${i}`)}
            />
            <ActionIcon
              color="red"
              variant="subtle"
              size="sm"
              aria-label={`Remove emoji ${i + 1}`}
              onClick={() => removeEmoji(i)}
            >
              <MinusCircleIcon size={16} />
            </ActionIcon>
          </Group>
        ))}
      </Stack>

      <Stack gap="xs">
        <Group justify="space-between">
          <div>
            <Text size="sm" fw={600}>
              Rating Breakdown
            </Text>
            <Text size="xs" c="dimmed">
              Per-use-case scores (0–5) shown as a breakdown chart.
            </Text>
          </div>
          <Button
            size="xs"
            variant="light"
            leftSection={<PlusCircleIcon size={14} />}
            onClick={addBreakdown}
          >
            Add category
          </Button>
        </Group>

        {ratingBreakdown.map((_, i) => (
          <Group key={i} gap="xs" align="flex-start">
            <TextInput
              style={{ flex: 1 }}
              placeholder="Category (e.g. Gaming)"
              {...form.getInputProps(`ratingBreakdown.${i}.category`)}
            />
            <NumberInput
              style={{ width: 120 }}
              min={0}
              max={5}
              step={0.5}
              placeholder="0–5"
              {...form.getInputProps(`ratingBreakdown.${i}.value`)}
            />
            <ActionIcon
              mt={4}
              color="red"
              variant="subtle"
              size="sm"
              aria-label={`Remove breakdown row ${i + 1}`}
              onClick={() => removeBreakdown(i)}
            >
              <MinusCircleIcon size={16} />
            </ActionIcon>
          </Group>
        ))}
      </Stack>
    </Stack>
  );
}
