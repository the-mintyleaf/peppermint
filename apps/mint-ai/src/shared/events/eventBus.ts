// src/shared/events/eventBus.ts
type RunEvent = {
  runId: string;
  type: string;
  data?: any;
};

type Listener = (event: RunEvent) => void;

class EventBus {
  private listeners: Record<string, Listener[]> = {};

  subscribe(runId: string, fn: Listener) {
    if (!this.listeners[runId]) this.listeners[runId] = [];
    this.listeners[runId].push(fn);

    return () => {
      this.listeners[runId] = this.listeners[runId].filter((l) => l !== fn);
    };
  }

  emitEvent(event: RunEvent) {
    const { runId } = event;
    const listeners = this.listeners[runId] || [];
    for (const fn of listeners) {
      fn(event);
    }
  }
}

export const eventBus = new EventBus();
