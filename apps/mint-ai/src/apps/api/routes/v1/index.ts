import { routeHealthCheck } from "./health";
import { routeRunsChat } from "./runs/chat";
import { routeRunsDeepseek } from "./runs/deepseek";
import { routeRunsPost } from "./runs/post";
import { routeRunsStream } from "./runs/stream";
import { routeRunsTest } from "./runs/testapi";

// ? V1 route bundle
export const routeV1 = {
  health: {
    healthCheck: routeHealthCheck,
  },
  runs: {
    post: routeRunsPost,
    get: routeRunsStream,
    stream: routeRunsStream,
    chat: routeRunsChat,
    deepseek: routeRunsDeepseek,
    testApi: routeRunsTest,
  },
};
