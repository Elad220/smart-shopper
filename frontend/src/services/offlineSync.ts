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
    console.error('[OfflineSync] Failed to set cache', err);
  }
};

const getCachedData = async (url: string) => {
  try {
    return await localforage.getItem(getCacheKey(url));
  } catch (err) {
    console.error('[OfflineSync] Failed to get cache', err);
    return null;
  }
};

const dispatchQueueChange = async () => {
  try {
    const q = (await localforage.getItem<QueuedRequest[]>(QUEUE_KEY)) || [];
    window.dispatchEvent(new CustomEvent('offlineSyncQueueChange', { detail: q.length }));
  } catch {/* ignore */}
};

const enqueueRequest = async (req: QueuedRequest) => {
  try {
    const existing = (await localforage.getItem<QueuedRequest[]>(QUEUE_KEY)) || [];
    existing.push(req);
    await localforage.setItem(QUEUE_KEY, existing);
    await dispatchQueueChange();
  } catch (err) {
    console.error('[OfflineSync] Failed to enqueue request', err);
  }
};

const flushQueue = async () => {
  const originalFetch = (globalThis as any).__originalFetch as typeof fetch;
  if (!originalFetch) return; // Should not happen

  try {
    let queue = (await localforage.getItem<QueuedRequest[]>(QUEUE_KEY)) || [];
    if (queue.length === 0) return;

    console.log(`[OfflineSync] Flushing ${queue.length} queued request(s)`);

    const stillPending: QueuedRequest[] = [];

    for (const req of queue) {
      try {
        const res = await originalFetch(req.url, req.options);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
      } catch (err) {
        // Keep in queue if still failing
        stillPending.push(req);
      }
    }

    await localforage.setItem(QUEUE_KEY, stillPending);
    await dispatchQueueChange();
  } catch (err) {
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
    // Ensure we correctly derive the request URL regardless of the input type.
    // - When `input` is a string we can use it directly.
    // - When `input` is a Request object we need to read the `url` property – calling
    //   toString() would just yield "[object Request]".
    // - When `input` is a URL object, toString() is fine.
    const url = typeof input === 'string'
      ? input
      : input instanceof Request
        ? input.url
        : input.toString();
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
      // Narrow the matching condition: only create optimistic responses for legitimate
      // item-creation endpoints (i.e. POST requests that target either `/api/items` or
      // `/api/shopping-lists/<id>/items`). This avoids accidentally matching unrelated
      // URLs such as `/categories/items` or `/items-backup`.

      const pathname = (() => {
        try {
          // Handle both absolute and relative request URLs gracefully.
          return new URL(url, typeof location !== 'undefined' ? location.origin : 'http://dummy').pathname;
        } catch {
          // In case URL parsing fails (should be rare), fall back to using the raw string.
          return url;
        }
      })();

      const isItemCreationEndpoint =
        method === 'POST' &&
        init.body &&
        (
          /\/shopping-lists\/[^/]+\/items$/.test(pathname) || // e.g. /api/shopping-lists/123/items
          /\/api\/items$/.test(pathname)                       // e.g. /api/items
        );

      if (isItemCreationEndpoint) {
        let bodyJson: Record<string, unknown> = {};

        if (typeof init.body === 'string') {
          try {
            const parsed = JSON.parse(init.body);
            if (
              parsed !== null &&
              typeof parsed === 'object' &&
              Object.getPrototypeOf(parsed) === Object.prototype
            ) {
              bodyJson = parsed as Record<string, unknown>;
            }
          } catch {
            /* Swallow JSON parse errors – fall back to empty object */
          }
        } else if (
          typeof init.body === 'object' &&
          init.body !== null &&
          Object.getPrototypeOf(init.body) === Object.prototype
        ) {
          bodyJson = init.body as unknown as Record<string, unknown>;
        }

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

      // Optimistic update for item modifications (PUT/PATCH)
      const isItemUpdateEndpoint =
        ['PUT', 'PATCH'].includes(method) &&
        /\/shopping-lists\/[^/]+\/items\/[A-Za-z0-9-]+$/.test(pathname);

      if (isItemUpdateEndpoint && init.body) {
        let bodyJson: Record<string, unknown> = {};
        if (typeof init.body === 'string') {
          try { bodyJson = JSON.parse(init.body); } catch {/* ignore */}
        } else if (typeof init.body === 'object' && init.body !== null) {
          bodyJson = init.body as any;
        }

        const idMatch = pathname.match(/\/items\/([^/]+)$/);
        const itemId = idMatch ? idMatch[1] : `offline-${Date.now()}`;

        const optimisticItem = { id: itemId, ...bodyJson };

        return new Response(JSON.stringify(optimisticItem), {
          status: 202,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // For DELETE requests, simply acknowledge
      if (method === 'DELETE') {
        return new Response(null, { status: 202 });
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