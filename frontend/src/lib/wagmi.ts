/**
 * @module wagmi
 * @description Wagmi configuration for the Purpose-Bound Rupee platform.
 * Configured for local Hardhat development network (localhost:8545, chainId 31337).
 * Uses SSR-safe cookie storage and HTTP transport.
 */

import { http, createConfig, createStorage, cookieStorage } from "wagmi";
import { type Chain } from "wagmi/chains";

// ──────────────────────────────────────────────
//  Custom Hardhat Chain Definition
// ──────────────────────────────────────────────

/**
 * Custom chain definition for the local Hardhat development network.
 * This avoids importing chains that aren't needed and gives us full control
 * over the chain configuration.
 */
export const hardhatLocal: Chain = {
  id: 31337,
  name: "Hardhat Local",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
  },
  blockExplorers: undefined,
  testnet: true,
};

// ──────────────────────────────────────────────
//  Wagmi Config
// ──────────────────────────────────────────────

/**
 * Wagmi configuration instance.
 *
 * Key design decisions:
 * - `ssr: true` prevents hydration mismatches in Next.js App Router.
 * - `cookieStorage` persists connection state across server/client renders.
 * - Only the local Hardhat chain is configured (no mainnet/testnet).
 * - HTTP transport targets localhost:8545 (Hardhat node).
 */
export const config = createConfig({
  chains: [hardhatLocal],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [hardhatLocal.id]: http("http://127.0.0.1:8545"),
  },
});

/**
 * Export the config type for use with Wagmi's type inference.
 */
declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
