import "dotenv/config";
import { runsQueue } from "@/orchestrator/queue";
import { randomUUID } from "node:crypto";

async function main() {
  const job = await runsQueue.add("dummy", {
    runId: randomUUID(),
    nodeId: "test-node",
    kind: "noop",
    payload: { hello: "world" },
  });
}

main().catch((err) => {
  console.error("Failed to enqueue job", err);
  process.exit(1);
});
