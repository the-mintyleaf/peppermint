import { toolApiCall } from "./apicall";
import { chatModels } from "./chatModels";
import { toolCheck } from "./check";

export const tools: any = {
  chatModels: chatModels,
  // Dynamic Tools
  "check.default": toolCheck,

  apicall: toolApiCall,
};
