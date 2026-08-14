import { useState, useEffect } from "react";
import type { AnalyticsData, AnalyticsPeriod } from "@/types";

export function useAnalytics(initialPeriod: AnalyticsPeriod = "week") {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState<AnalyticsPeriod>(initialPeriod);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchAnalytics() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/analytics?period=${period}`);
        if (!res.ok) {
          throw new Error("Failed to fetch analytics");
        }
        const json = await res.json();
        if (isMounted) {
          setData(json);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchAnalytics();

    return () => {
      isMounted = false;
    };
  }, [period]);

  return {
    data,
    period,
    setPeriod,
    isLoading,
    error,
  };
}
