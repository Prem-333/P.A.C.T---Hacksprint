/**
 * @module server/apiAuth
 * @description API authentication guard — validates session cookies
 * and enforces role-based access on sensitive endpoints.
 */

import { cookies } from "next/headers";
import type { UserRole } from "@/lib/server/wallet";

const SESSION_COOKIE = "pbr_session";

export interface SessionData {
  username: string;
  name: string;
  role: UserRole;
  address: string;
  description: string;
  loginAt: number;
}

/**
 * Extracts and validates the session from the request cookie.
 * Returns null if no valid session exists.
 */
export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const data = JSON.parse(decoded) as SessionData;

    // Basic validation
    if (!data.username || !data.role || !data.address) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Validates that the current session has one of the allowed roles.
 * Returns the session if valid, or null if unauthorized.
 */
export async function requireRole(...allowedRoles: UserRole[]): Promise<SessionData | null> {
  const session = await getSession();
  if (!session) return null;
  if (!allowedRoles.includes(session.role)) return null;
  return session;
}
