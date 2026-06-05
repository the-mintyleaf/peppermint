import { schemaWorkflow } from "@/workflows/workflowRegistry.type";

export const workflowBusinessOnboarding = schemaWorkflow.parse({
  id: "business.onboarding",
  entry: "system.guardPolicy",
  nodes: [
    { id: "system.guardPolicy", kind: "system.guardPolicy" },
    {
      id: "agents.reasoning",
      kind: "agents.reasoning",
      config: {
        chatModel: "deepseek.chat",
        systemPrompt: "You are the onboarding assistant ...",
        dependencies: [
          "businessName",
          "businessType",
          "address",
          "ownerName",
          "contact",
          "services",
        ],
        temperature: 0.7,
        memoryLimit: 20,
        tools: [
          {
            name: "createBusinessRecord",
            type: "apicall",
            description: "Creates a new business record after onboarding.",
            config: {
              method: "POST",
              url: "https://api.myapp.com/onboarding/business",
              headers: { "Content-Type": "application/json" },
              schema: {
                type: "object",
                properties: {
                  businessName: { type: "string" },
                  businessType: { type: "string" },
                  address: { type: "string" },
                  ownerName: { type: "string" },
                  contact: { type: "string" },
                  services: { type: "string" },
                },
                required: [
                  "businessName",
                  "businessType",
                  "address",
                  "ownerName",
                  "contact",
                ],
              },
              withAuthentication: true,
              authenticationConfig: {
                type: "bearer",
                tokenEnv: "VAGENT_API_TOKEN",
              },
              body: {
                businessName: "${{fromAI(businessName)}}",
                businessType: "${{fromAI(businessType)}}",
                address: "${{fromAI(address)}}",
                ownerName: "${{fromAI(ownerName)}}",
                contact: "${{fromAI(contact)}}",
                services: "${{fromAI(services)}}",
              },
            },
          },
        ],
      },
    },
  ],
  edges: [{ from: "system.guardPolicy", to: "agents.reasoning" }],
});
