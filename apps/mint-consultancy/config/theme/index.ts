import { createTheme } from "@zetsel/ui";
import { configThemeMantineMain } from "./theme.mantine.main";
import { configThemeMantineComponents } from "./theme.mantine.components";

export const configThemeMantine = createTheme({
  ...configThemeMantineMain,
  components: configThemeMantineComponents,
});
