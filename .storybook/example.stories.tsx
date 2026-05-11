import type { Meta, StoryObj } from "@storybook/react";

// This is an example story file to show the structure
// Copy and adapt this when creating stories for your components

interface ExampleProps {
  label: string;
  primary?: boolean;
  size?: "small" | "medium" | "large";
  disabled?: boolean;
}

function Example({ label, primary = false, size = "medium", disabled = false }: ExampleProps) {
  const baseStyles: React.CSSProperties = {
    padding: size === "small" ? "8px 12px" : size === "large" ? "16px 24px" : "12px 16px",
    fontSize: size === "small" ? "12px" : size === "large" ? "16px" : "14px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    cursor: disabled ? "not-allowed" : "pointer",
    backgroundColor: primary ? "#007bff" : "#fff",
    color: primary ? "#fff" : "#000",
    opacity: disabled ? 0.5 : 1,
  };

  return (
    <button style={baseStyles} disabled={disabled}>
      {label}
    </button>
  );
}

const meta = {
  title: "Example/Button",
  component: Example,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    primary: { control: "boolean" },
    size: { control: "select", options: ["small", "medium", "large"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    label: "Primary Button",
    primary: true,
  },
};

export const Secondary: Story = {
  args: {
    label: "Secondary Button",
    primary: false,
  },
};

export const Large: Story = {
  args: {
    label: "Large Button",
    size: "large",
  },
};

export const Small: Story = {
  args: {
    label: "Small Button",
    size: "small",
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled Button",
    disabled: true,
  },
};
