'use client';

import { Container, Title, Text, Group, Button, Paper } from '@zetsel/ui';
import { ChatWelcomeProps } from './ChatWelcome.types';
import styles from './ChatWelcome.module.css';

export function ChatWelcome({ userName = 'User' }: ChatWelcomeProps) {
  return (
    <Container className={styles.welcomeContainer}>
      <div className={styles.content}>
        <Title size="h2" fw={300} ta="center" className={styles.greeting}>
          Good Morning, <span className={styles.name}>{userName}</span>.
        </Title>
        <Text size="lg" ta="center" className={styles.subtext}>
          Shell we start our day today!
        </Text>

        <Group justify="center" mt="xl" gap="xl">
          <Paper className={styles.suggestionCard}>
            <Text size="sm" fw={500}>
              ✨ Get insights
            </Text>
            <Text size="xs" c="dimmed">
              Ask about your data
            </Text>
          </Paper>
          <Paper className={styles.suggestionCard}>
            <Text size="sm" fw={500}>
              📊 Generate reports
            </Text>
            <Text size="xs" c="dimmed">
              Create visualizations
            </Text>
          </Paper>
          <Paper className={styles.suggestionCard}>
            <Text size="sm" fw={500}>
              ⚡ Automate tasks
            </Text>
            <Text size="xs" c="dimmed">
              Save time
            </Text>
          </Paper>
        </Group>
      </div>
    </Container>
  );
}
