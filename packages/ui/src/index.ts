export * from "@mantine/core";
export * from "@mantine/hooks";
export * from "@mantine/dates";
export * from "@mantine/modals";
export * from "@mantine/notifications";
export * from "@mantine/nprogress";
export * from "@mantine/spotlight";
export * from "@mantine/form";
// Heavy domains are NOT re-exported here — import them from their subpath entries
// to keep recharts/tiptap/embla out of the main barrel's closure:
//   @peppermint/ui/charts · /editor · /carousel · /code-highlight · /dropzone
export * from "@tanstack/react-query";
export { dayjs } from "./dayjs";

// `noop` is exported by more than one starred module (e.g. @mantine/core and
// @tanstack/react-query); an explicit re-export disambiguates the otherwise
// ambiguous `export *` (TS2308). Fuller barrel rework is tracked as H7 (Phase 2).
export { noop } from "@mantine/core";

export * from "./wrappers/AppWrapper";
export * from "./wrappers/QueryClientWrapper";

export * from "./components";
