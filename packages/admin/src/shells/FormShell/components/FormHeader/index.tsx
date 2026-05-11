import React from 'react';
import { Anchor, Breadcrumbs, Group, Text } from '@zetsel/ui';
import { useFormControls } from '../../../../wrappers/FormWrapper';
import type { BreadcrumbItem } from '../../FormShell.types';

interface FormHeaderProps {
  title: string;
  bread?: BreadcrumbItem[];
}

export function FormHeader({ title, bread }: FormHeaderProps) {
  const { isLoading } = useFormControls();

  return (
    <Group justify="space-between" p="md" style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
      <div>
        {bread && bread.length > 0 ? (
          <Breadcrumbs>
            {bread.map((item, i) =>
              item.href ? (
                <Anchor key={i} href={item.href} size="sm">
                  {item.label}
                </Anchor>
              ) : (
                <Text key={i} size="sm" c="dimmed">
                  {item.label}
                </Text>
              ),
            )}
          </Breadcrumbs>
        ) : (
          <Text fw={600} size="lg">
            {title}
          </Text>
        )}
      </div>
      {isLoading && (
        <Text size="sm" c="dimmed">
          Saving...
        </Text>
      )}
    </Group>
  );
}
