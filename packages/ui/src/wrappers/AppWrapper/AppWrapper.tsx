'use client';

import React from 'react';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import cx from 'clsx';
import { QueryClientWrapper } from '../QueryClientWrapper';
import classes from './AppWrapper.module.css';
import type { AppWrapperProps } from './AppWrapper.types';

export function AppWrapper({
  extraHeadTags,
  title = 'built to build.',
  theme,
  defaultColorScheme = 'light',
  classNames,
  withQuery = false,
  children,
}: AppWrapperProps) {
  const content = (
    <MantineProvider theme={theme} defaultColorScheme={defaultColorScheme}>
      <ModalsProvider>
        <Notifications />
        {children}
      </ModalsProvider>
    </MantineProvider>
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript
          nonce="8IBTHwOdqNKAWeKl7plt8g=="
          defaultColorScheme={defaultColorScheme}
        />
        <title>{title}</title>
        {extraHeadTags}
      </head>
      <body className={cx(classes.root, classNames?.body)}>
        {withQuery ? <QueryClientWrapper>{content}</QueryClientWrapper> : content}
      </body>
    </html>
  );
}
