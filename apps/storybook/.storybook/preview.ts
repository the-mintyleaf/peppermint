const preview = {
  parameters: {
    layout: "centered",
    a11y: {
      config: {
        rules: [
          {
            id: "color-contrast",
            enabled: true,
          },
          {
            id: "valid-aria-role",
            enabled: true,
          },
        ],
      },
    },
  },
};

export default preview;
