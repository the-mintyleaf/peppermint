import { createTheme, MantineTheme } from "@zetsel/ui"

import { configThemeMantineMain } from "./theme.mantine.main";
import { configThemeMantineComponents } from "./theme.mantine.components";

export const configThemeMantine: any = createTheme({
  ...configThemeMantineMain,
  components: configThemeMantineComponents,
});
