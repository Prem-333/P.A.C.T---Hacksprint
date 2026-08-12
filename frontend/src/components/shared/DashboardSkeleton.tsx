"use client";

/**
 * @module DashboardSkeleton
 * @description A premium skeleton loader for the dashboard to prevent jarring layout shifts.
 */

export function DashboardSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      {/* Sidebar Skeleton */}
      <div className="w-64 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col">
        <div className="p-6 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl skeleton shrink-0" />
            <div className="flex-1">
              <div className="h-4 skeleton w-24 mb-2 rounded" />
              <div className="h-3 skeleton w-32 rounded" />
            </div>
          </div>
        </div>
        <div className="p-4 space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 skeleton rounded-lg w-full" />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Skeleton */}
        <header className="h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded skeleton" />
            <div>
              <div className="h-4 skeleton w-32 mb-1 rounded" />
              <div className="h-3 skeleton w-48 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full skeleton" />
            <div className="flex items-center gap-3 bg-[var(--color-surface-subtle)] py-1.5 px-3 rounded-full">
              <div className="w-6 h-6 rounded-full skeleton" />
              <div className="h-3 skeleton w-20 rounded" />
            </div>
            <div className="w-20 h-8 rounded skeleton" />
          </div>
        </header>

        {/* Main Content Skeleton */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card p-5 h-28 flex flex-col justify-center">
                <div className="h-3 skeleton w-24 mb-3 rounded" />
                <div className="h-8 skeleton w-32 rounded" />
              </div>
            ))}
          </div>
          
          <div className="glass-card p-6 h-96">
            <div className="flex justify-between items-center mb-6">
              <div className="h-5 skeleton w-40 rounded" />
              <div className="h-8 skeleton w-32 rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border border-[var(--color-border)] rounded-xl overflow-hidden h-72 flex flex-col">
                  <div className="h-28 skeleton w-full" />
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="h-4 skeleton w-3/4 mb-2 rounded" />
                    <div className="h-3 skeleton w-1/2 mb-4 rounded" />
                    <div className="mt-auto space-y-2">
                      <div className="h-10 skeleton w-full rounded" />
                      <div className="h-8 skeleton w-full rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
