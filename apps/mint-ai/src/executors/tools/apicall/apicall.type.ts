import { z } from "zod";

/**
 * API Call Tool Input Schema
 *
 * Flexible schema that accepts:
 * - Any structured data for the request body/query
 * - Can be further resolved via resolveToolConfig
 */
export const schemaApiCallInput = z.record(z.string(), z.unknown());
export type PropApiCallInput = z.infer<typeof schemaApiCallInput>;

/**
 * API Call Tool Output Schema
 *
 * Returns JSON string of the API response (or extracted dataKey)
 */
export const schemaApiCallOutput = z.string();
export type PropApiCallOutput = z.infer<typeof schemaApiCallOutput>;

/**
 * Tool configuration
 */
export interface ApiCallConfig {
  name?: string;
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  query?: Record<string, any>;
  body?: Record<string, any>;
  dataKey?: string;
}
