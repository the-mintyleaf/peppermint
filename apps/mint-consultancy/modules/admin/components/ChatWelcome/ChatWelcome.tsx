"use client";

import { Stack, Text } from "@zetsel/ui";
import { ChatWelcomeProps } from "./ChatWelcome.types";
import styles from "./ChatWelcome.module.css";

export function ChatWelcome({ userName = "User" }: ChatWelcomeProps) {
  return (
    <Stack gap={4} className={styles.greeting}>
      <Text size="1.7rem" ta="center" fw={300} className={styles.greetingLine}>
        Good Morning,{" "}
        <Text span fw={600} className={styles.name}>
          {userName}
        </Text>
        .
      </Text>
      <Text size="1.7rem" fw={300} ta="center">
        Shall we start our day today!
      </Text>
    </Stack>
  );
}
