import { z } from "zod";
import { nodeBaseSchema } from "@/types/contracts";

/**
 * ? Workflow Edge
 * - Represents a directed connection between nodes
 */
export const workflowEdgeSchema = z.object({
  from: z.string().uuid(),
  to: z.string().uuid(),
});

/**git add
 * ? Workflow Node
 * - Extends the base node contract
 */
export const workflowNodeSchema = nodeBaseSchema.extend({
  kind: z.string(), // e.g. "guard.policy", "llm.reason"
});

/**
 * ? Workflow Graph
 * - Contains nodes, edges, and entry point
 */
export const workflowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  entry: z.string().uuid(),
  nodes: z.array(workflowNodeSchema),
  edges: z.array(workflowEdgeSchema),
});

export type PropWorkflow = z.infer<typeof workflowSchema>;

/**
 * ? Example: Minimal guard → reason workflow
 */
export const exampleWorkflow = workflowSchema.parse({
  id: "11111111-1111-1111-1111-111111111111",
  name: "Minimal Chatbot",
  entry: "22222222-2222-2222-2222-222222222222",
  nodes: [
    {
      id: "22222222-2222-2222-2222-222222222222",
      kind: "guard.policy",
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      kind: "llm.reason",
    },
  ],
  edges: [
    {
      from: "22222222-2222-2222-2222-222222222222",
      to: "33333333-3333-3333-3333-333333333333",
    },
  ],
});
