import type { MantineColorScheme, MantineThemeOverride } from '@mantine/core';
import type { ReactNode } from 'react';

export interface AppWrapperClassNames {
  body?: string;
}

export interface AppWrapperProps {
  children: ReactNode;
  title?: string;
  theme?: MantineThemeOverride;
  defaultColorScheme?: MantineColorScheme;
  extraHeadTags?: ReactNode;
  classNames?: AppWrapperClassNames;
  withQuery?: boolean;
}
