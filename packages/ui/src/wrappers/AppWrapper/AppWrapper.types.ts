import type { MantineColorScheme, MantineThemeOverride } from '@mantine/core';
import type { ReactNode } from 'react';

export interface AppWrapperProps {
  children: ReactNode;
  theme?: MantineThemeOverride;
  defaultColorScheme?: MantineColorScheme;
  withQuery?: boolean;
}
