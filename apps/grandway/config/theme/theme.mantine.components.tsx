"use client";

import {
  Button,
  Container,
  MultiSelect,
  NumberInput,
  PasswordInput,
  PillsInput,
  Select,
  TextInput,
  Textarea,
  Text,
  Menu,
  Modal,
  MantineSize,
  DateInput,
  MonthPickerInput,
  YearPickerInput,
  Input,
  SegmentedControl,
  TagsInput,
  Autocomplete,
  Switch,
  Combobox,
} from "@peppermint/ui";
import type { MantineThemeOverride } from "@peppermint/ui";

type propDefaults = {
  fontSize: string;
  lineHeight: string;
  inputSize: MantineSize;
  containerSize: number | string;
};

const defaults: propDefaults = {
  fontSize: "var(--mantine-font-size-xs)",
  lineHeight: "",
  inputSize: "sm",
  containerSize: 1440,
};

const defaultInputStyleProps = {
  input: {
    fontSize: defaults.fontSize,
  },
  label: {
    fontSize: defaults.fontSize,
  },
  error: {
    fontSize: defaults.fontSize,
  },
};

export const configThemeMantineComponents: MantineThemeOverride["components"] =
  {
    Container: Container.extend({
      defaultProps: {
        size: defaults?.containerSize || "",
      },
    }),
    Text: Text.extend({
      defaultProps: {
        fw: 500,
      },
    }),
    Button: Button.extend({
      defaultProps: {
        size: defaults.inputSize,
        style: {
          fontSize: defaults.fontSize,
        },
      },
    }),

    TextInput: TextInput.extend({
      defaultProps: {
        size: defaults.inputSize,
        styles: {
          label: {
            fontSize: defaults.fontSize,
          },
          input: {
            fontSize: defaults.fontSize,
          },
        },
      },
    }),

    PillsInput: PillsInput.extend({
      defaultProps: {
        size: defaults.inputSize,
        styles: {
          label: {
            fontSize: defaults.fontSize,
          },
          input: {
            fontSize: defaults.fontSize,
          },
        },
      },
    }),
    PasswordInput: PasswordInput.extend({
      defaultProps: {
        size: defaults.inputSize,
        styles: {
          label: {
            fontSize: defaults.fontSize,
          },
          input: {
            fontSize: defaults.fontSize,
          },
        },
      },
    }),
    NumberInput: NumberInput.extend({
      defaultProps: {
        size: defaults.inputSize,
        styles: {
          label: {
            fontSize: defaults.fontSize,
          },
          input: {
            fontSize: defaults.fontSize,
          },
        },
      },
    }),
    Textarea: Textarea.extend({
      defaultProps: {
        size: defaults.inputSize,
        styles: {
          label: {
            fontSize: defaults.fontSize,
          },
          input: {
            fontSize: defaults.fontSize,
          },
        },
      },
    }),
    Select: Select.extend({
      defaultProps: {
        size: defaults.inputSize,
        styles: {
          ...defaultInputStyleProps,
          label: {
            fontSize: defaults.fontSize,
          },
          option: {
            fontSize: defaults.fontSize,
          },
        },
      },
    }),
    Pills: PillsInput.extend({
      defaultProps: {
        size: defaults.inputSize,
        styles: {
          input: {
            fontSize: defaults.fontSize,
          },
        },
      },
    }),
    MultiSelect: MultiSelect.extend({
      defaultProps: {
        size: defaults.inputSize,
        styles: {
          ...defaultInputStyleProps,
          label: {
            fontSize: defaults.fontSize,
          },
          option: {
            fontSize: defaults.fontSize,
          },
        },
      },
    }),
    DateInput: DateInput.extend({
      defaultProps: {
        size: defaults.inputSize,
        styles: defaultInputStyleProps,
      },
    }),
    MonthPickerInput: MonthPickerInput.extend({
      defaultProps: {
        size: defaults.inputSize,
        styles: defaultInputStyleProps,
      },
    }),
    YearPickerInput: YearPickerInput.extend({
      defaultProps: {
        size: defaults.inputSize,
        styles: defaultInputStyleProps,
      },
    }),

    // The rest of the form controls, so a form built from them (the student
    // certificate's segmented grades, tags, autocompletes) reads at the same
    // size as one built from plain inputs (the bank forms).
    InputWrapper: Input.Wrapper.extend({
      defaultProps: {
        styles: {
          label: { fontSize: defaults.fontSize },
          description: { fontSize: defaults.fontSize },
          error: { fontSize: defaults.fontSize },
        },
      },
    }),
    SegmentedControl: SegmentedControl.extend({
      defaultProps: {
        size: "xs",
      },
    }),
    TagsInput: TagsInput.extend({
      defaultProps: {
        size: defaults.inputSize,
        styles: {
          ...defaultInputStyleProps,
          option: { fontSize: defaults.fontSize },
          pill: { fontSize: defaults.fontSize },
        },
      },
    }),
    Autocomplete: Autocomplete.extend({
      defaultProps: {
        size: defaults.inputSize,
        styles: {
          ...defaultInputStyleProps,
          option: { fontSize: defaults.fontSize },
        },
      },
    }),
    Switch: Switch.extend({
      defaultProps: {
        styles: {
          label: { fontSize: defaults.fontSize },
          description: { fontSize: defaults.fontSize },
        },
      },
    }),
    // Hand-built dropdowns (Combobox) get the same option size as Select's.
    Combobox: Combobox.extend({
      defaultProps: {
        styles: {
          option: { fontSize: defaults.fontSize },
        },
      },
    }),

    Menu: Menu.extend({
      defaultProps: {
        styles: {
          item: {
            fontSize: defaults.fontSize,
          },
        },
      },
    }),
    Modal: Modal.extend({
      defaultProps: {
        styles: {
          header: {
            fontSize: "var(--mantine-font-size-sm) !important",
            fontWeight: 900,
            borderBottom: "1px solid var(--mantine-color-gray-light)",
          },
          body: {
            padding: 0,
          },
        },
      },
    }),
  };
