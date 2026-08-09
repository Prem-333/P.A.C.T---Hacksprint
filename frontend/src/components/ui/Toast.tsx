"use client";

/**
 * @module Toast
 * @description Global toast notification system with context and provider.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckIcon, XIcon, AlertCircleIcon, InfoIcon } from "./Icons";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (options: Omit<ToastMessage, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback(
    ({ type, message, description, duration = 5000 }: Omit<ToastMessage, "id">) => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [...prev, { id, type, message, description, duration }]);
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  const { id, type, message, description, duration } = toast;
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onDismiss(id), 300); // match animation duration
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, id, onDismiss]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => onDismiss(id), 300);
  };

  const icons = {
    success: <CheckIcon className="text-emerald-500" />,
    error: <AlertCircleIcon className="text-rose-500" />,
    warning: <AlertCircleIcon className="text-amber-500" />,
    info: <InfoIcon className="text-blue-500" />,
  };

  const bgs = {
    success: "bg-emerald-50 border-emerald-200",
    error: "bg-rose-50 border-rose-200",
    warning: "bg-amber-50 border-amber-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <div
      className={`relative overflow-hidden w-80 p-4 rounded-xl border shadow-lg backdrop-blur bg-white/95 ${
        bgs[type]
      } ${
        isLeaving ? "animate-toast-leave" : "animate-toast-enter"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">{icons[type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            {message}
          </p>
          {description && (
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {description}
            </p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <XIcon size={16} />
        </button>
      </div>
      {/* Progress bar */}
      {duration && (
        <div
          className="absolute bottom-0 left-0 h-1 bg-black/5 animate-toast-progress"
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
    </div>
  );
}
