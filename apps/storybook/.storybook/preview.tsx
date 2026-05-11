import React from 'react';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { QueryClientWrapper } from '@zetsel/ui';
import type { Preview, Decorator } from '@storybook/react';

const withMantine: Decorator = (Story) => (
  <QueryClientWrapper>
    <MantineProvider>
      <ModalsProvider>
        <Notifications />
        <Story />
      </ModalsProvider>
    </MantineProvider>
  </QueryClientWrapper>
);

const preview: Preview = {
  decorators: [withMantine],
  parameters: {
    layout: 'padded',
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'valid-aria-role', enabled: true },
        ],
      },
    },
  },
};

export default preview;
