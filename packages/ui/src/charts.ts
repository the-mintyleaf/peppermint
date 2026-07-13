// Heavy domain (recharts) — opt-in via `@peppermint/ui/charts` so it stays out of
// the main barrel's dependency closure. CSS co-located so components render styled.
import "@mantine/charts/styles.css";
export * from "@mantine/charts";
