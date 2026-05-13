"use client";

import { useFormInstance } from "@zetsel/admin";
import {
  Checkbox,
  Grid,
  Stack,
  Text,
  TextInput,
} from "@zetsel/ui";
import type { ProductFormValues } from "../productForm.types";

export function StepPricing() {
  const { form } = useFormInstance<ProductFormValues>();

  return (
    <Stack gap="lg">
      <div>
        <Text size="sm" fw={600} mb={4}>
          Pricing & Availability
        </Text>
        <Text size="xs" c="dimmed">
          Enter prices as formatted strings matching your display convention
          (e.g. &quot;4,38,000&quot;). The currency symbol is stored separately so it can
          render inline.
        </Text>
      </div>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <TextInput
            label="Currency Symbol"
            placeholder="रु"
            {...form.getInputProps("currency")}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 4 }}>
          <TextInput
            label="Selling Price"
            description="The actual price charged"
            placeholder="4,38,000"
            {...form.getInputProps("price")}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 4 }}>
          <TextInput
            label="MRP"
            description="Manufacturer's retail price (before discount)"
            placeholder="4,81,900"
            {...form.getInputProps("mrp")}
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Stack gap="sm" mt="xs">
            <Checkbox
              label="In Stock"
              description="Uncheck to show as out of stock on the storefront"
              {...form.getInputProps("inStock", { type: "checkbox" })}
            />
            <Checkbox
              label="Free Shipping"
              description="Display free shipping badge on the product page"
              {...form.getInputProps("freeShipping", { type: "checkbox" })}
            />
            <Checkbox
              label="VAT Inclusive"
              description="Price shown already includes VAT"
              {...form.getInputProps("vatInclusive", { type: "checkbox" })}
            />
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
