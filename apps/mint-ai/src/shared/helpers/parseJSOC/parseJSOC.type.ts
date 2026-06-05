import { z } from "zod";

export const schemaJsocParseResult = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
});

export type PropJsocParseResult = z.infer<typeof schemaJsocParseResult>;
