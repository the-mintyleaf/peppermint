import { z } from "zod";

// ? Input schema for check tool
export const toolCheckInputSchema = z.object({
  input: z.string(),
});

// ? Output schema for check tool
export const toolCheckOutputSchema = z.object({
  result: z.string(),
});

export type PropToolCheckInput = z.infer<typeof toolCheckInputSchema>;
export type PropToolCheckOutput = z.infer<typeof toolCheckOutputSchema>;
