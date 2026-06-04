"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  Badge,
  Avatar,
  SimpleGrid,
} from "@zetsel/ui";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { PencilIcon } from "@phosphor-icons/react/dist/csr/Pencil";
import { useRouter } from "next/navigation";
import type { Product } from "../../module.api";

interface ProductViewProps {
  productId: string;
}

export function ProductView({ productId }: ProductViewProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `https://dummyjson.com/products/${productId}`
        );
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Text>Loading...</Text>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container size="lg" py="xl">
        <Text>Product not found</Text>
      </Container>
    );
  }

  const discountedPrice = product.price * (1 - product.discountPercentage / 100);
  const statusColor =
    product.availabilityStatus === "In Stock"
      ? "green"
      : product.availabilityStatus === "Low Stock"
        ? "yellow"
        : "red";

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="lg">
        <Button
          variant="subtle"
          leftSection={<ArrowLeftIcon size={16} />}
          onClick={() => router.back()}
        >
          Back
        </Button>
        <Button
          leftSection={<PencilIcon size={16} />}
          onClick={() => router.push(`/admin/product-management/products/${productId}/edit`)}
        >
          Edit Product
        </Button>
      </Group>

      <Stack gap="lg">
        {/* Header Section */}
        <Paper withBorder p="lg">
          <Group justify="space-between" mb="md">
            <div>
              <Text size="2rem" fw={600} mb="xs">
                {product.title}
              </Text>
              <Text size="sm" c="dimmed">
                SKU: {product.sku}
              </Text>
            </div>
            <Badge size="lg" color={statusColor}>
              {product.availabilityStatus}
            </Badge>
          </Group>

          <Group gap="lg" mb="md">
            <Avatar src={product.thumbnail} size="xl" radius="md" />
            <Stack gap="xs">
              <Text fw={500}>{product.brand}</Text>
              <Text size="sm" c="dimmed">
                {product.category}
              </Text>
              <Group gap="md">
                <Badge color="blue">{product.tags.join(", ")}</Badge>
              </Group>
            </Stack>
          </Group>

          <Divider my="md" />

          <Text size="sm" mb="md" style={{ whiteSpace: "pre-wrap" }}>
            {product.description}
          </Text>
        </Paper>

        {/* Pricing Section */}
        <Paper withBorder p="lg">
          <Text fw={600} mb="md" size="lg">
            Pricing Information
          </Text>
          <SimpleGrid cols={2} spacing="lg">
            <Stack gap="xs">
              <Text size="sm" c="dimmed">
                Original Price
              </Text>
              <Text fw={600} size="xl">
                ${product.price.toFixed(2)}
              </Text>
            </Stack>

            <Stack gap="xs">
              <Text size="sm" c="dimmed">
                Discount
              </Text>
              <Text fw={600} size="xl" c="red">
                {product.discountPercentage.toFixed(1)}%
              </Text>
            </Stack>

            <Stack gap="xs">
              <Text size="sm" c="dimmed">
                Final Price
              </Text>
              <Text fw={600} size="xl" c="green">
                ${discountedPrice.toFixed(2)}
              </Text>
            </Stack>

            <Stack gap="xs">
              <Text size="sm" c="dimmed">
                Stock Available
              </Text>
              <Text fw={600} size="xl">
                {product.stock} units
              </Text>
            </Stack>
          </SimpleGrid>
        </Paper>

        {/* Rating Section */}
        <Paper withBorder p="lg">
          <Text fw={600} mb="md" size="lg">
            Customer Ratings
          </Text>
          <SimpleGrid cols={2} spacing="lg">
            <Stack gap="xs">
              <Text size="sm" c="dimmed">
                Average Rating
              </Text>
              <Group gap="xs">
                <Text fw={600} size="2xl">
                  {product.rating.toFixed(1)}
                </Text>
                <Text size="sm">/ 5</Text>
              </Group>
            </Stack>

            <Stack gap="xs">
              <Text size="sm" c="dimmed">
                Total Reviews
              </Text>
              <Text fw={600} size="2xl">
                {product.rating > 0 ? Math.floor(product.rating * 100) : 0}
              </Text>
            </Stack>
          </SimpleGrid>
        </Paper>

        {/* Additional Info */}
        <Paper withBorder p="lg">
          <Text fw={600} mb="md" size="lg">
            Additional Information
          </Text>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  Brand
                </Text>
                <Text fw={500}>{product.brand}</Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  Category
                </Text>
                <Text fw={500}>{product.category}</Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  SKU
                </Text>
                <Text fw={500}>{product.sku}</Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  Tags
                </Text>
                <Group gap="xs">
                  {product.tags.map((tag) => (
                    <Badge key={tag} size="sm" variant="light">
                      {tag}
                    </Badge>
                  ))}
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>
      </Stack>
    </Container>
  );
}
