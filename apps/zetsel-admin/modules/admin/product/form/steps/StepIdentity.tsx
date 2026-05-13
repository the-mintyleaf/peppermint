"use client";

import { useFormInstance } from "@zetsel/admin";
import {
  ActionIcon,
  Button,
  Grid,
  Group,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@zetsel/ui";
import { MinusCircleIcon, PlusCircleIcon } from "@phosphor-icons/react";
import type { ProductFormValues } from "../productForm.types";

export function StepIdentity() {
  const { form } = useFormInstance<ProductFormValues>();

  const breadcrumbs = form.getValues().breadcrumbs;

  const addBreadcrumb = () =>
    form.insertListItem("breadcrumbs", { label: "", href: "#" });

  const removeBreadcrumb = (index: number) =>
    form.removeListItem("breadcrumbs", index);

  return (
    <Stack gap="lg">
      <div>
        <Text size="sm" fw={600} mb={4}>
          Product Identity
        </Text>
        <Text size="xs" c="dimmed">
          These fields define the product slug, brand, and display names. The
          ID becomes the URL slug — use kebab-case.
        </Text>
      </div>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label="Product ID (slug)"
            description="Lowercase, hyphens only. e.g. asus-rog-zephyrus-g16"
            placeholder="asus-rog-zephyrus-g16-2025"
            {...form.getInputProps("id")}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label="Brand"
            placeholder="ASUS"
            {...form.getInputProps("brand")}
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <TextInput
            label="Brand Logo URL"
            placeholder="https://..."
            {...form.getInputProps("brandLogo")}
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <TextInput
            label="Short Name"
            description="Shown in cards and listings"
            placeholder="ASUS ROG Zephyrus G16 - 2025 Edition"
            {...form.getInputProps("shortName")}
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Textarea
            label="Full Name"
            description="The complete product title shown on the product page"
            placeholder="Asus ROG Zephyrus G16 2025 GU605 Intel Core Ultra 9..."
            autosize
            minRows={2}
            maxRows={5}
            {...form.getInputProps("fullName")}
          />
        </Grid.Col>
      </Grid>

      <Stack gap="xs">
        <Group justify="space-between">
          <div>
            <Text size="sm" fw={600}>
              Breadcrumbs
            </Text>
            <Text size="xs" c="dimmed">
              Navigation trail shown above the product. Order matters.
            </Text>
          </div>
          <Button
            size="xs"
            variant="light"
            leftSection={<PlusCircleIcon size={14} />}
            onClick={addBreadcrumb}
          >
            Add breadcrumb
          </Button>
        </Group>

        {breadcrumbs.map((_, i) => (
          <Group key={i} gap="xs" align="flex-start">
            <TextInput
              style={{ flex: 1 }}
              placeholder="Label"
              {...form.getInputProps(`breadcrumbs.${i}.label`)}
            />
            <TextInput
              style={{ flex: 1 }}
              placeholder="href (e.g. #)"
              {...form.getInputProps(`breadcrumbs.${i}.href`)}
            />
            <ActionIcon
              mt={4}
              color="red"
              variant="subtle"
              size="sm"
              aria-label={`Remove breadcrumb ${i + 1}`}
              onClick={() => removeBreadcrumb(i)}
              disabled={breadcrumbs.length === 1}
            >
              <MinusCircleIcon size={16} />
            </ActionIcon>
          </Group>
        ))}
      </Stack>
    </Stack>
  );
}
