"use client";

/**
 * @module RootRouter
 * @description Main entry point. Checks for active session cookie,
 * redirects to login if not authenticated, or to the specific role dashboard
 * if authenticated.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserSession } from "@/hooks/useDashboard";

export default function RootPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("pbr_session="));
      
    if (!cookie) {
      router.push("/login");
      return;
    }
    
    try {
      const token = decodeURIComponent(cookie.substring("pbr_session=".length));
      const data = JSON.parse(atob(token)) as UserSession;
      
      // Redirect to the appropriate dashboard page
      router.push(`/${data.role}`);
    } catch {
      // If parsing fails, redirect to login
      router.push("/login");
    }
  }, [router]);

  // Render a minimal loading state while checking the session and redirecting
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="inline-block w-8 h-8 border-3 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin mb-4" />
          <p className="text-sm text-[var(--color-text-muted)]">Routing...</p>
        </div>
      </div>
    );
  }

  return null;
}
