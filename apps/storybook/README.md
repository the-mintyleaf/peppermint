# Storybook

Component showcase and testing environment for Peppermint UI components.

## Getting Started

### Run Storybook

```bash
pnpm dev
```

Storybook will start on `http://localhost:6006`.

### Build Storybook

```bash
pnpm build
```

## Creating Stories

Stories are automatically discovered from `**/*.stories.tsx` files in the packages.

### Story Structure

Create a story file next to your component:

```
UserCard/
├── UserCard.tsx
├── UserCard.types.ts
├── UserCard.stories.tsx  ← Story file
└── index.ts
```

### Example Story

```tsx
// UserCard.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { UserCard, type UserCardProps } from "./UserCard";

const meta = {
  title: "Components/UserCard",
  component: UserCard,
  tags: ["autodocs"],
  argTypes: {
    userName: { control: "text" },
    userEmail: { control: "text" },
  },
} satisfies Meta<typeof UserCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    userName: "John Doe",
    userEmail: "john@example.com",
  },
};

export const WithLongName: Story = {
  args: {
    userName: "This is a very long name that might wrap",
    userEmail: "very.long.email@example.com",
  },
};
```

## Addons

The following addons are configured:

- **@storybook/addon-essentials** — Controls, actions, docs, viewport, toolbars
- **@storybook/addon-interactions** — Interaction testing
- **@storybook/addon-links** — Navigation between stories
- **@storybook/addon-a11y** — Accessibility audits and checks

### Accessibility Testing

Use the **a11y** tab to audit components for:
- Color contrast issues
- ARIA role validity
- Keyboard navigation

## Naming Convention

Use descriptive titles for stories:

```
title: "Components/UserCard"      ← Groups stories in UI
title: "Forms/LoginForm"          ← Different section
title: "Layouts/AdminLayout"      ← Another grouping
```

This creates a clear hierarchy in the Storybook UI.
