import { logger } from "@/shared/logging";
import { schemaWorkflow, PropWorkflow } from "./workflowRegistry.type";
import { workflowMomoSalesbot } from "./momo/salesbot";
import { workflowBusinessOnboarding } from "./momo/onboarding";
import { workflowJoker } from "./joker";
import { workflowDeepseekReasoning } from "./deepseek";

const workflows: Record<string, any> = {
  "momo.salesbot": workflowMomoSalesbot,
  "business.onboarding": workflowBusinessOnboarding,
  "joker.chatbot": workflowJoker,
  "deepseek.reasoning": workflowDeepseekReasoning,
};

// ? Register a workflow (validates at startup)
export function registerWorkflow(def: PropWorkflow) {
  const parsed = schemaWorkflow.parse(def);
  workflows[parsed.id] = parsed;
}

// ? Get workflow by id
export function getWorkflow(id: string): PropWorkflow | undefined {
  return workflows[id];
}

registerWorkflow(workflowMomoSalesbot);
registerWorkflow(workflowBusinessOnboarding);
registerWorkflow(workflowJoker);
registerWorkflow(workflowDeepseekReasoning);
