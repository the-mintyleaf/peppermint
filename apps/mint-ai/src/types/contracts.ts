import { z } from "zod";

/**
 * ? Base contract for all nodes
 * - Every node has an id, kind, and config
 */
export const nodeBaseSchema = z.object({
  id: z.string(),
  kind: z.string(), // e.g. "guard.policy", "llm.reason"
  config: z.record(z.string(), z.any()).optional(),
});

/**
 * ? Guard Policy Node
 * - Input: string message
 * - Output: allow | deny
 */
export const nodeGuardPolicyInput = z.object({
  message: z.string(),
});
export type PropNodeGuardPolicyInput = z.infer<typeof nodeGuardPolicyInput>;

export const nodeGuardPolicyOutput = z.object({
  allow: z.boolean(),
  reason: z.string().optional(),
});
export type PropNodeGuardPolicyOutput = z.infer<typeof nodeGuardPolicyOutput>;

/**
 * ? LLM Reason Node
 * - Input: sessionId + prompt
 * - Output: structured reply
 */
export const nodeLLMReasonInput = z.object({
  sessionId: z.string(),
  prompt: z.string(),
});
export type PropNodeLLMReasonInput = z.infer<typeof nodeLLMReasonInput>;

export const nodeLLMReasonOutput = z.object({
  reply: z.string(),
  summary: z.string().optional(),
});
export type PropNodeLLMReasonOutput = z.infer<typeof nodeLLMReasonOutput>;
