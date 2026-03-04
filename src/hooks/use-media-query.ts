"use client";

import { useState, useEffect } from "react";

/**
 * Hook that tracks whether a CSS media query matches.
 * Useful for responsive logic in components.
 *
 * @example
 * const isMobile = useMediaQuery("(max-width: 640px)");
 * const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
