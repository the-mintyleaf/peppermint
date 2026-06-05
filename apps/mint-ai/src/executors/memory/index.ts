import { nodeSessionFetch } from "./session/fetch";
import { nodeSessionUpdate } from "./session/update";

export const memory = {
  session: {
    fetch: nodeSessionFetch,
    update: nodeSessionUpdate,
  },
};
