import { nodeAIReasoning } from "./agents/reasoning";
import { nodeGuardPolicy } from "./system/nodeGuardPolicy";
import { nodeNoop } from "./system/nodeNoop";

export const nodes: any = {
  system: {
    nodeNoop: nodeNoop,
    guardPolicy: nodeGuardPolicy,
  },
  agents: {
    reasoning: nodeAIReasoning,
  },
};
