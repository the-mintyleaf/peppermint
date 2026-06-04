import { memory } from "./memory";
import { nodes } from "./nodes";
import { tools } from "./tools";

type ExecutorFn = (input: any) => Promise<any>;

// ? Registry mapping kind → executor function
export const executorRegistry = {
  nodes: nodes,
  tools: tools,
  memory: memory,
};
