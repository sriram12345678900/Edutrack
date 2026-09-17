"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect if viewport width is below a given breakpoint (default 768px - md breakpoint).
 * SSR-safe: defaults to false on server, updates on hydration and resize.
 */
export function useMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    setIsMobile(mql.matches);

    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    if (mql.addEventListener) {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    } else {
      // Fallback for older browsers
      mql.addListener(onChange);
      return () => mql.removeListener(onChange);
    }
  }, [breakpoint]);

  return isMobile;
}

export default useMobile;
