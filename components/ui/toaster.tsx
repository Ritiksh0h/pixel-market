"use client";

import { create } from "zustand";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: Toast[];
  add: (message: string, type?: ToastType) => void;
  remove: (id: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  add: (message, type = "info") => {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// Convenience methods
export const toast = {
  success: (msg: string) => useToast.getState().add(msg, "success"),
  error: (msg: string) => useToast.getState().add(msg, "error"),
  info: (msg: string) => useToast.getState().add(msg, "info"),
};

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const colors = {
  success: "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300",
  error: "border-red-500/30 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300",
  info: "border-blue-500/30 bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300",
};

export function Toaster() {
  const toasts = useToast((s) => s.toasts);
  const remove = useToast((s) => s.remove);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-fade-in",
              colors[t.type]
            )}
          >
            <Icon className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm flex-1">{t.message}</p>
            <button onClick={() => remove(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
