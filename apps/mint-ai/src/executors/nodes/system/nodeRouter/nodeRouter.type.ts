import { z } from "zod";

export const schemaRouterCondition = z.object({
  when: z.record(z.string(), z.string()),
  target: z.string(),
});

export const schemaNodeRouterInput = z.object({
  sessionId: z.string(),
  message: z.string().optional(),
  prevOutput: z.unknown().optional(),
});

export const schemaNodeRouterOutput = z.object({
  target: z.string(),
  matched: z.boolean(),
});

export type RouterCondition = z.infer<typeof schemaRouterCondition>;
export type PropNodeRouterInput = z.infer<typeof schemaNodeRouterInput>;
export type PropNodeRouterOutput = z.infer<typeof schemaNodeRouterOutput>;

export interface NodeRouterConfig {
  conditions: RouterCondition[];
  fallback: string;
}
