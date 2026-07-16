export { LayoutAppShell } from "./AppShell";
export { useAppShellStore } from "./app-shell.store";
// NOTE: `nav.config` is intentionally NOT re-exported here. It imports Phosphor
// icon components (which call `createContext`) and has no "use client", so
// pulling it through this barrel into the Server-Component `(app)/layout.tsx`
// makes it evaluate on the server and throws. The client nav components import
// it directly from "./nav.config".
