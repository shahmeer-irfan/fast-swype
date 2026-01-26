"use client";

import { useEffect, useState } from "react";

export function usePageLoader(delayMs: number = 800) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  return isLoading;
}
