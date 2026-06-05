import { eventBus } from "@/shared/events/eventBus";

eventBus.emitEvent({
  runId: "3bcc299a-c689-4545-85d6-44d46131642f",
  type: "run.started",
});

eventBus.emitEvent({
  runId: "3bcc299a-c689-4545-85d6-44d46131642f",
  type: "token",
  data: { value: "Hello from eventBus!" },
});

eventBus.emitEvent({
  runId: "3bcc299a-c689-4545-85d6-44d46131642f",
  type: "run.finished",
});
