import { getRedisClient, getRedisSubscriber } from "@/shared/redis/redis";

type RunEvent = {
  runId: string;
  type: string;
  data?: any;
};

type Listener = (event: RunEvent) => void;

class EventBus {
  private listeners: Record<string, Listener[]> = {};
  private initialized = false;

  private ensureInitialized() {
    if (this.initialized) return;
    this.initialized = true;

    const sub = getRedisSubscriber();
    sub.on("message", (channel: string, message: string) => {
      try {
        const event: RunEvent = JSON.parse(message);
        const fns = this.listeners[event.runId];
        if (!fns) return;
        for (const fn of fns) fn(event);
      } catch {
        // malformed message — ignore
      }
    });
  }

  subscribe(runId: string, fn: Listener) {
    this.ensureInitialized();

    if (!this.listeners[runId]) {
      this.listeners[runId] = [];
      getRedisSubscriber().subscribe(`run:${runId}:events`);
    }
    this.listeners[runId].push(fn);

    return () => {
      this.listeners[runId] = this.listeners[runId].filter((l) => l !== fn);
      if (!this.listeners[runId].length) {
        delete this.listeners[runId];
        getRedisSubscriber().unsubscribe(`run:${runId}:events`);
      }
    };
  }

  emitEvent(event: RunEvent) {
    getRedisClient().publish(
      `run:${event.runId}:events`,
      JSON.stringify(event),
    );
  }
}

export const eventBus = new EventBus();
