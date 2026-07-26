export interface SectionHeadingProps {
  title: string;
  /** One-line clarification of what the section shows / how to read it. */
  subtitle?: string;
  /** Optional right-aligned control (e.g. a scope note or link). */
  right?: React.ReactNode;
  /** Anchor id so in-page alert links (`#today-worklists`) can target it. */
  id?: string;
}
