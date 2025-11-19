import { useEffect, useRef, useCallback } from "react";

export function usePolling(callback, interval = 30000) {
  const savedCallback = useRef(callback);
  const intervalIdRef = useRef(null);

  // Mindig a legfrissebb callback-et használjuk
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const startPolling = useCallback(() => {
    if (intervalIdRef.current) return; // Már fut

    // Azonnal meghívjuk egyszer
    savedCallback.current();

    // Elindítjuk az intervallumot
    intervalIdRef.current = setInterval(() => {
      savedCallback.current();
    }, interval);
  }, [interval]);

  const stopPolling = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  // Automatikus indítás és cleanup
  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  return { startPolling, stopPolling };
}

