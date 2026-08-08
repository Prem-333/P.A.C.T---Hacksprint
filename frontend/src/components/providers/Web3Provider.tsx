"use client";

/**
 * @module Web3Provider
 * @description Root provider for Web3 functionality.
 * Wraps the application with WagmiProvider (wallet/chain management)
 * and QueryClientProvider (TanStack Query for data fetching).
 *
 * Must be a client component due to React Context requirements.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  // Create a stable QueryClient instance that persists across renders
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Refetch data every 10 seconds for near-real-time updates
            refetchInterval: 10_000,
            // Keep stale data while refetching
            staleTime: 5_000,
          },
        },
      })
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
