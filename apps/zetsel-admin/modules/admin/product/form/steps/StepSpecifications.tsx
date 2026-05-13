"use client";

import { useFormInstance } from "@zetsel/admin";
import {
  ActionIcon,
  Button,
  Divider,
  Group,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@zetsel/ui";
import { MinusCircleIcon, PlusCircleIcon } from "@phosphor-icons/react";
import type { ProductFormValues } from "../productForm.types";

function SpecRow({
  fieldBase,
  index,
  onRemove,
  disableRemove,
  multiline,
}: {
  fieldBase: string;
  index: number;
  onRemove: () => void;
  disableRemove: boolean;
  multiline?: boolean;
}) {
  const { form } = useFormInstance<ProductFormValues>();

  return (
    <Group gap="xs" align="flex-start">
      <TextInput
        style={{ width: 180, flexShrink: 0 }}
        placeholder="Label"
        {...form.getInputProps(`${fieldBase}.${index}.label`)}
      />
      {multiline ? (
        <Textarea
          style={{ flex: 1 }}
          placeholder="Value"
          autosize
          minRows={1}
          maxRows={4}
          {...form.getInputProps(`${fieldBase}.${index}.value`)}
        />
      ) : (
        <TextInput
          style={{ flex: 1 }}
          placeholder="Value"
          {...form.getInputProps(`${fieldBase}.${index}.value`)}
        />
      )}
      <ActionIcon
        mt={4}
        color="red"
        variant="subtle"
        size="sm"
        aria-label={`Remove row ${index + 1}`}
        onClick={onRemove}
        disabled={disableRemove}
      >
        <MinusCircleIcon size={16} />
      </ActionIcon>
    </Group>
  );
}

export function StepSpecifications() {
  const { form } = useFormInstance<ProductFormValues>();

  const specHighlights = form.getValues().specHighlights;
  const specifications = form.getValues().specifications;

  const addHighlight = () =>
    form.insertListItem("specHighlights", { label: "", value: "" });
  const removeHighlight = (i: number) =>
    form.removeListItem("specHighlights", i);

  const addSpec = () =>
    form.insertListItem("specifications", { label: "", value: "" });
  const removeSpec = (i: number) => form.removeListItem("specifications", i);

  return (
    <Stack gap="lg">
      <div>
        <Text size="sm" fw={600} mb={4}>
          Specifications
        </Text>
        <Text size="xs" c="dimmed">
          Spec highlights appear prominently above the fold. Full specifications
          go in the expandable table below. Longer values (CPU description,
          connections) should use the full specs section.
        </Text>
      </div>

      <Stack gap="xs">
        <Group justify="space-between">
          <div>
            <Text size="sm" fw={600}>
              Spec Highlights
            </Text>
            <Text size="xs" c="dimmed">
              6–8 key specs shown in the hero area (short values only).
            </Text>
          </div>
          <Button
            size="xs"
            variant="light"
            leftSection={<PlusCircleIcon size={14} />}
            onClick={addHighlight}
          >
            Add highlight
          </Button>
        </Group>

        {specHighlights.map((_, i) => (
          <SpecRow
            key={i}
            fieldBase="specHighlights"
            index={i}
            onRemove={() => removeHighlight(i)}
            disableRemove={specHighlights.length === 1}
          />
        ))}
      </Stack>

      <Divider />

      <Stack gap="xs">
        <Group justify="space-between">
          <div>
            <Text size="sm" fw={600}>
              Full Specifications
            </Text>
            <Text size="xs" c="dimmed">
              Complete spec table. Long values (e.g. CPU string) are fine here.
            </Text>
          </div>
          <Button
            size="xs"
            variant="light"
            leftSection={<PlusCircleIcon size={14} />}
            onClick={addSpec}
          >
            Add specification
          </Button>
        </Group>

        {specifications.map((_, i) => (
          <SpecRow
            key={i}
            fieldBase="specifications"
            index={i}
            onRemove={() => removeSpec(i)}
            disableRemove={specifications.length === 1}
            multiline
          />
        ))}
      </Stack>
    </Stack>
  );
}
