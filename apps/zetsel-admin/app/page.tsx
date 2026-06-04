"use client";

import { Center, Container, Paper, Text, Title } from "@zetsel/ui";

export default function () {
  return (
    <>
      <Paper h="100vh" bg="gray.2">
        <Center h="100vh">
          <Container size="md">
            <Title fw={300} size="2rem" ta="center">
              built to{" "}
              <span
                style={{
                  color: "var(--mantine-color-brand-6)",
                }}
              >
                build.
              </span>
            </Title>

            <Text size="xs" ta="center">
              zet - sell - go
            </Text>
          </Container>
        </Center>
      </Paper>
    </>
  );
}
