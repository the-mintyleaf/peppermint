import { z } from "zod";

export const schemaWorkflowNode = z.object({
  id: z.string(),
  kind: z.string(),
  config: z.record(z.string(), z.unknown()).optional(),
});
export type PropWorkflowNode = z.infer<typeof schemaWorkflowNode>;

export const schemaWorkflowEdge = z.object({
  from: z.string(),
  to: z.string(),
});
export type PropWorkflowEdge = z.infer<typeof schemaWorkflowEdge>;

export const schemaWorkflow = z.object({
  id: z.string(),
  entry: z.string(),
  nodes: z.array(schemaWorkflowNode),
  edges: z.array(schemaWorkflowEdge),
});
export type PropWorkflow = z.infer<typeof schemaWorkflow>;
