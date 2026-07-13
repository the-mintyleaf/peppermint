export * from "@mantine/core";
export * from "@mantine/hooks";
export * from "@mantine/dates";
export * from "@mantine/modals";
export * from "@mantine/notifications";
export * from "@mantine/nprogress";
export * from "@mantine/spotlight";
export * from "@mantine/tiptap";
export * from "@mantine/carousel";
export * from "@mantine/charts";
export * from "@mantine/code-highlight";
export * from "@mantine/dropzone";
export * from "@mantine/form";
export * from "@tanstack/react-query";
export { default as dayjs } from "dayjs";

// `noop` is exported by more than one starred module (e.g. @mantine/core and
// @tanstack/react-query); an explicit re-export disambiguates the otherwise
// ambiguous `export *` (TS2308). Fuller barrel rework is tracked as H7 (Phase 2).
export { noop } from "@mantine/core";

export * from "./wrappers/AppWrapper";
export * from "./wrappers/QueryClientWrapper";

export * from "./components";
