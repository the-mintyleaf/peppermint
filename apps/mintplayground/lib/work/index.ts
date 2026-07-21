/**
 * Frozen shared contract for the backend `work` domain (60 endpoints, backend
 * v1.5.0). Imported by every work surface — cases, tasks, calendar, dashboard —
 * so DTOs / enums / query keys / error handling / view-model helpers are
 * defined once. See `apps/mintflow/docs/api-contracts/work.md` for the digest
 * this traces to. Per-module `*.api.ts` fetch functions live in each module and
 * import from here.
 */

export * from "./enums";
export * from "./types";
export * from "./queryKeys";
export * from "./errors";
export * from "./mappers";
export * from "./directory";
