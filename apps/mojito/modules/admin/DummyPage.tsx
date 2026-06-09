import { Text } from "@zetsel/ui";

interface DummyPageProps {
  title: string;
}

export function DummyPage({ title }: DummyPageProps) {
  return (
    <Text p="md" c="gray.3" size="lg">
      Hi, this is {title}
    </Text>
  );
}
