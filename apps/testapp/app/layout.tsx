import { AppWrapper } from '@zetsel/ui';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <AppWrapper title="Zetsel">{children}</AppWrapper>;
}
