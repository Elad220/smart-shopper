import localforage from 'localforage';

/**
 * offlineSync.ts - Provides basic offline support with:
 * 1. Caching of GET requests (JSON only).
 * 2. Queuing of mutation requests (POST/PUT/PATCH/DELETE).
 * 3. Automatic replay of queued requests when the browser comes back online.
 * 4. A global fetch() override so no changes are required in the rest of the code-base.
 *
 * NOTE: This implementation favours simplicity over exhaustive conflict resolution.
 *       If a queued request fails to replay, it stays in the queue and will be tried
 *       again on the next "online" event.
 */

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

localforage.config({
  name: 'smart-shopper-offline',
  storeName: 'offline_store',
});

const CACHE_PREFIX = 'cache:'; // Prefix for response cache
const QUEUE_KEY = 'offlineRequestQueue'; // Key holding request queue in localForage

interface QueuedRequest {
  url: string;
  options: RequestInit;
  timestamp: number;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

const getCacheKey = (url: string) => `${CACHE_PREFIX}${url}`;

const setCachedData = async (url: string, data: unknown) => {
  try {
    await localforage.setItem(getCacheKey(url), data);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[OfflineSync] Failed to set cache', err);
  }
};

const getCachedData = async (url: string) => {
  try {
    return await localforage.getItem(getCacheKey(url));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[OfflineSync] Failed to get cache', err);
    return null;
  }
};

const enqueueRequest = async (req: QueuedRequest) => {
  try {
    const existing = (await localforage.getItem<QueuedRequest[]>(QUEUE_KEY)) || [];
    existing.push(req);
    await localforage.setItem(QUEUE_KEY, existing);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[OfflineSync] Failed to enqueue request', err);
  }
};

const flushQueue = async () => {
  const originalFetch = (globalThis as any).__originalFetch as typeof fetch;
  if (!originalFetch) return; // Should not happen

  try {
    let queue = (await localforage.getItem<QueuedRequest[]>(QUEUE_KEY)) || [];
    if (queue.length === 0) return;

    // eslint-disable-next-line no-console
    console.log(`[OfflineSync] Flushing ${queue.length} queued request(s)`);

    const stillPending: QueuedRequest[] = [];

    for (const req of queue) {
      try {
        const res = await originalFetch(req.url, req.options);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        // If the request was a GET we cache the response again
        if ((req.options.method || 'GET').toUpperCase() === 'GET') {
          const json = await res.clone().json().catch(() => null);
          if (json !== null) await setCachedData(req.url, json);
        }
      } catch (err) {
        // Keep in queue if still failing
        stillPending.push(req);
      }
    }

    await localforage.setItem(QUEUE_KEY, stillPending);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[OfflineSync] Failed flushing queue', err);
  }
};

/* -------------------------------------------------------------------------- */
/* fetch() Override                                                            */
/* -------------------------------------------------------------------------- */

export const setupOfflineFetch = () => {
  /* Prevent multiple overrides */
  if ((globalThis as any).__offlineFetchPatched) return;
  (globalThis as any).__offlineFetchPatched = true;

  const originalFetch = globalThis.fetch.bind(globalThis);
  // Keep reference in case we need to call it inside flushQueue
  (globalThis as any).__originalFetch = originalFetch;

  globalThis.fetch = async (
    input: RequestInfo | URL,
    init: RequestInit = {}
  ): Promise<Response> => {
    const method = (init.method || 'GET').toUpperCase();
    const url = typeof input === 'string' ? input : input.toString();
    const isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    /* ONLINE -------------------------------------------------------------- */
    if (navigator.onLine) {
      try {
        const response = await originalFetch(input, init);
        // Cache successful GET JSON responses
        if (response.ok && !isWrite) {
          const cloned = response.clone();
          const contentType = cloned.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await cloned.json().catch(() => null);
            if (data !== null) await setCachedData(url, data);
          }
        }
        return response;
      } catch (err) {
        // Network error while we thought we were online – fallback to offline path
        // eslint-disable-next-line no-console
        console.warn('[OfflineSync] Network error, treating as offline', err);
      }
    }

    /* OFFLINE ------------------------------------------------------------- */
    if (!isWrite) {
      // Attempt to serve from cache
      const cached = await getCachedData(url);
      if (cached !== null) {
        return new Response(JSON.stringify(cached), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      // No cached copy — return empty array/object so UI can still render
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // For write requests while offline -> queue them and return ACK
    const requestToQueue: QueuedRequest = {
      url,
      options: { ...init, method },
      timestamp: Date.now(),
    };
    await enqueueRequest(requestToQueue);

    // Try to craft a best-effort optimistic result for certain endpoints
    try {
      if (url.includes('/items') && method === 'POST' && init.body) {
        const bodyJson = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
        const optimisticItem = {
          id: `offline-${Date.now()}`,
          completed: false,
          ...bodyJson,
        };
        return new Response(JSON.stringify(optimisticItem), {
          status: 202,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch {/* Fallback to generic response */}

    return new Response(JSON.stringify({ queued: true }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  // Attempt to flush queue immediately if online
  if (navigator.onLine) flushQueue();

  // Listen for connectivity changes
  window.addEventListener('online', flushQueue);
};

/* -------------------------------------------------------------------------- */
/* Public API (optional, can be used elsewhere)                                */
/* -------------------------------------------------------------------------- */

export const initOfflineSync = () => {
  setupOfflineFetch();
};

// Auto-initialize as soon as this module is imported
initOfflineSync();