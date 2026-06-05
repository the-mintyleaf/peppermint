import { z } from "zod";

// ? Input schema for guard.policy
export const nodeGuardPolicyInputSchema = z.object({
  message: z.string(),
});

// ? Output schema
export const nodeGuardPolicyOutputSchema = z.object({
  allow: z.boolean(),
  reason: z.string().optional(),
});

export type PropNodeGuardPolicyInput = z.infer<
  typeof nodeGuardPolicyInputSchema
>;
export type PropNodeGuardPolicyOutput = z.infer<
  typeof nodeGuardPolicyOutputSchema
>;
