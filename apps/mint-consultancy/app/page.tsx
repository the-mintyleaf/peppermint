"use client";

import { Paper, Center, Container, Title, Text } from "@zetsel/ui";

export default function Home() {
  return (
    <Center style={{ height: "100vh" }} w="100%">
      <Paper p="xl" radius="md" withBorder>
        <Container size="sm" p="xl">
          <Title order={1} mb="sm">
            built to <span style={{ color: "var(--mantine-color-brand-5)" }}>build.</span>
          </Title>
          <Text c="dimmed" mb="lg">
            mint - consultancy - go
          </Text>
          <Text size="sm">
            Navigate to <code>/admin</code> to get started.
          </Text>
        </Container>
      </Paper>
    </Center>
  );
}
