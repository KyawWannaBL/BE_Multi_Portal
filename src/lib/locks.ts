/**
 * src/lib/locks.ts
 *
 * Supabase Auth uses a "lock" function to prevent concurrent token/session writes.
 * In some setups (especially React StrictMode), the default Navigator LockManager-based
 * lock can time out and spam: `Acquiring an exclusive Navigator LockManager lock ... timed out`.
 *
 * This implementation is process-local (single tab / single JS context) and avoids navigator.locks.
 * Trade-off: it does NOT coordinate across multiple tabs.
 */

export type LockFunc = <R>(name: string, acquireTimeout: number, fn: () => Promise<R>) => Promise<R>;

type Waiter = {
  id: symbol;
  resolve: (release: () => void) => void;
  reject: (err: Error) => void;
  timer: number | null;
};

class Mutex {
  private locked = false;
  private waiters: Waiter[] = [];

  async acquire(acquireTimeout: number): Promise<() => void> {
    if (!this.locked) {
      this.locked = true;
      return () => this.release();
    }

    if (acquireTimeout === 0) {
      const err = new Error("Lock acquisition timed out after 0ms.");
      (err as any).isAcquireTimeout = true;
      throw err;
    }

    const id = Symbol("waiter");

    return await new Promise<() => void>((resolve, reject) => {
      const waiter: Waiter = {
        id,
        resolve: (release) => {
          if (waiter.timer) window.clearTimeout(waiter.timer);
          resolve(release);
        },
        reject: (err) => {
          if (waiter.timer) window.clearTimeout(waiter.timer);
          reject(err);
        },
        timer: null,
      };

      if (acquireTimeout > 0) {
        waiter.timer = window.setTimeout(() => {
          const idx = this.waiters.findIndex((w) => w.id === id);
          if (idx >= 0) this.waiters.splice(idx, 1);

          const err = new Error(`Lock acquisition timed out after ${acquireTimeout}ms.`);
          (err as any).isAcquireTimeout = true;
          waiter.reject(err);
        }, acquireTimeout);
      }

      this.waiters.push(waiter);
    });
  }

  private release() {
    const next = this.waiters.shift();
    if (!next) {
      this.locked = false;
      return;
    }
    // Keep locked=true; ownership transfers to the next waiter.
    next.resolve(() => this.release());
  }
}

const mutexes = new Map<string, Mutex>();

/**
 * Process-local lock (single tab).
 *
 * We intentionally clamp the acquire timeout to reduce noisy failures in dev
 * when React StrictMode causes overlapping auth calls.
 */
export const processLock: LockFunc = async (name, acquireTimeout, fn) => {
  const timeout = acquireTimeout < 0 ? -1 : Math.max(acquireTimeout, 60_000);
  const mutex = mutexes.get(name) ?? new Mutex();
  if (!mutexes.has(name)) mutexes.set(name, mutex);

  const release = await mutex.acquire(timeout);
  try {
    return await fn();
  } finally {
    release();
  }
};
