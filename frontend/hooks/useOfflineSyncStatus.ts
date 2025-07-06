import { useState, useEffect } from 'react';
import localforage from 'localforage';

const QUEUE_KEY = 'offlineRequestQueue';

export const useOfflineSyncStatus = () => {
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [pending, setPending] = useState<number>(0);

  const refreshPending = async () => {
    try {
      const queue = (await localforage.getItem<any[]>(QUEUE_KEY)) || [];
      setPending(queue.length);
    } catch {
      setPending(0);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      refreshPending();
    };
    const handleOffline = () => setOnline(false);
    const handleQueueChange = () => {
      // detail contains new length, but we refresh to be safe
      refreshPending();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offlineSyncQueueChange', handleQueueChange);

    // Initial check
    refreshPending();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offlineSyncQueueChange', handleQueueChange);
    };
  }, []);

  return { online, pending };
};