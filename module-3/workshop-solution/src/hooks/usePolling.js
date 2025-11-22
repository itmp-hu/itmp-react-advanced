import { useEffect, useRef } from "react";

/**
 * Custom hook polling-hoz
 * @param {Function} callback - A függvény, amit rendszeresen hívni kell
 * @param {number} interval - Az intervallum milliszekundumban (alapértelmezett: 30000 = 30 mp)
 * @param {boolean} enabled - Engedélyezve van-e a polling (alapértelmezett: true)
 */
export function usePolling(callback, interval = 30000, enabled = true) {
  const savedCallback = useRef();

  // Mentsd el a legfrissebb callback-et
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Állítsd be az intervallumot
  useEffect(() => {
    if (!enabled) {
      return;
    }

    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }

    const id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [interval, enabled]);
}

