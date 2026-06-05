import { registerWorkflow } from "@/workflows";
import {
  PropWorkflow,
  schemaWorkflow,
} from "@/workflows/workflowRegistry.type";
import { systemPrompt } from "./prompt";

export const workflowMomoSalesbot = schemaWorkflow.parse({
  id: "momo.salesbot",
  entry: "system.guardPolicy",
  nodes: [
    {
      id: "system.guardPolicy",
      kind: "system.guardPolicy",
    },
    {
      id: "agents.reasoning",
      kind: "agents.reasoning",
      config: {
        chatModel: "deepseek.chat",
        systemPrompt: systemPrompt,
        dependencies: ["category"],
        temperature: 0.7,
        memoryLimit: 1000, // fetch last 5 messages from session memory
        // tools: [
        //   {
        //     name: "getProductCategory",
        //     type: "apicall",
        //     description: `
        //       `,
        //     config: {
        //       method: "GET",
        //       url: "https://dummyjson.com/products/category-list",
        //       headers: {},

        //       withAuthentication: false,
        //       authenticationConfig: {},

        //       query: {},
        //       body: {},
        //     },
        //   },
        //   {
        //     name: "getProductsByCategory",
        //     type: "apicall",
        //     description: `
        //       Fetches products by category.
        //       `,
        //     config: {
        //       method: "GET",
        //       url: "https://dummyjson.com/products/category/${{fromAI(category)}}",
        //       headers: {},
        //       schema: {
        //         type: "object",
        //         properties: {
        //           category: {
        //             type: "string",
        //             description: "The category of products, e.g. 'laptops'",
        //           },
        //         },
        //         required: ["category"],
        //       },
        //       withAuthentication: false,
        //       authenticationConfig: {},
        //       dataKey: "products",
        //       query: {},
        //       body: {},
        //     },
        //   },
        //   {
        //     name: "getProductData",
        //     type: "apicall",
        //     description: "Fetches all product data and information",
        //     config: {
        //       method: "GET",
        //       url: "https://dummyjson.com/products",
        //       headers: {},

        //       withAuthentication: false,
        //       authenticationConfig: {},

        //       dataKey: "products",

        //       query: {},
        //       body: {},
        //     },
        //   },
        // ],
      },
    },
  ],
  edges: [{ from: "system.guardPolicy", to: "agents.reasoning" }],
});
