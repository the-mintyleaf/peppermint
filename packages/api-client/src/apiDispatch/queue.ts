type QueuedFn = () => Promise<unknown>;

const queue: QueuedFn[] = [];

export function enqueue(fn: QueuedFn): void {
  queue.push(fn);
}

export async function drain(): Promise<void> {
  while (queue.length > 0) {
    const fn = queue.shift();
    if (fn) {
      try {
        await fn();
      } catch {
        // Individual mutation failures do not stop the drain
      }
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    drain();
  });
}
