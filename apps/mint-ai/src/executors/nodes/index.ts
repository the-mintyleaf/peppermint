import { nodeAIReasoning } from "./agents/reasoning";
import { nodeGuardPolicy } from "./system/nodeGuardPolicy";
import { nodeNoop } from "./system/nodeNoop";
import { nodeRouter } from "./system/nodeRouter";

export const nodes: any = {
  system: {
    nodeNoop: nodeNoop,
    guardPolicy: nodeGuardPolicy,
    router: nodeRouter,
  },
  agents: {
    reasoning: nodeAIReasoning,
  },
};
