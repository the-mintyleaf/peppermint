"use client";

import { useFormInstance } from "@zetsel/admin";
import {
  ActionIcon,
  Button,
  ColorInput,
  Grid,
  Group,
  Stack,
  Text,
  TextInput,
} from "@zetsel/ui";
import { MinusCircleIcon, PlusCircleIcon } from "@phosphor-icons/react";
import type { ProductFormValues } from "../productForm.types";

export function StepMedia() {
  const { form } = useFormInstance<ProductFormValues>();

  const images = form.getValues().images;
  const colorOptions = form.getValues().colorOptions;

  const addImage = () => form.insertListItem("images", "");
  const removeImage = (i: number) => form.removeListItem("images", i);

  const addColor = () =>
    form.insertListItem("colorOptions", { name: "", hex: "#000000" });
  const removeColor = (i: number) => form.removeListItem("colorOptions", i);

  return (
    <Stack gap="lg">
      <div>
        <Text size="sm" fw={600} mb={4}>
          Media
        </Text>
        <Text size="xs" c="dimmed">
          Product images (URLs), a video link, and color variants. Images are
          shown in the gallery in order — put the hero image first.
        </Text>
      </div>

      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="sm" fw={600}>
            Images
          </Text>
          <Button
            size="xs"
            variant="light"
            leftSection={<PlusCircleIcon size={14} />}
            onClick={addImage}
          >
            Add image
          </Button>
        </Group>

        {images.map((_, i) => (
          <Group key={i} gap="xs" align="flex-start">
            <TextInput
              style={{ flex: 1 }}
              placeholder={`Image ${i + 1} URL`}
              {...form.getInputProps(`images.${i}`)}
            />
            <ActionIcon
              mt={4}
              color="red"
              variant="subtle"
              size="sm"
              aria-label={`Remove image ${i + 1}`}
              onClick={() => removeImage(i)}
              disabled={images.length === 1}
            >
              <MinusCircleIcon size={16} />
            </ActionIcon>
          </Group>
        ))}
      </Stack>

      <Grid>
        <Grid.Col span={12}>
          <TextInput
            label="Video URL"
            description="Optional product video link"
            placeholder="https://youtube.com/..."
            {...form.getInputProps("videoUrl")}
          />
        </Grid.Col>
      </Grid>

      <Stack gap="xs">
        <Group justify="space-between">
          <div>
            <Text size="sm" fw={600}>
              Color Options
            </Text>
            <Text size="xs" c="dimmed">
              Each variant the customer can select on the product page.
            </Text>
          </div>
          <Button
            size="xs"
            variant="light"
            leftSection={<PlusCircleIcon size={14} />}
            onClick={addColor}
          >
            Add color
          </Button>
        </Group>

        {colorOptions.map((_, i) => (
          <Group key={i} gap="xs" align="flex-start">
            <TextInput
              style={{ flex: 1 }}
              placeholder="Color name (e.g. Eclipse Gray)"
              {...form.getInputProps(`colorOptions.${i}.name`)}
            />
            <ColorInput
              style={{ width: 180 }}
              placeholder="#111111"
              {...form.getInputProps(`colorOptions.${i}.hex`)}
            />
            <ActionIcon
              mt={4}
              color="red"
              variant="subtle"
              size="sm"
              aria-label={`Remove color ${i + 1}`}
              onClick={() => removeColor(i)}
            >
              <MinusCircleIcon size={16} />
            </ActionIcon>
          </Group>
        ))}
      </Stack>
    </Stack>
  );
}
