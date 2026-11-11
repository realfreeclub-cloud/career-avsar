"use client";

import * as React from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

export type ToastTone = "info" | "success" | "error";
export type ToastItem = { id: string; tone: ToastTone; title: string; message?: string };

const icons = { info: Info, success: CheckCircle2, error: AlertCircle };
const iconColors: Record<ToastTone, string> = {
  info: "text-secondary",
  success: "text-success",
  error: "text-danger",
};
const borderColors: Record<ToastTone, string> = {
  info: "border-[#D5DFEB]",
  success: "border-green-200",
  error: "border-red-200",
};

type ToastContextValue = {
  push: (toast: Omit<ToastItem, "id">) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const push = React.useCallback((toast: Omit<ToastItem, "id">) => {
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
    setItems((prev) => [...prev, { ...toast, id }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col gap-2 p-3 sm:inset-x-auto sm:right-0 sm:w-full sm:max-w-sm sm:p-4"
      >
        {items.map((item) => {
          const Icon = icons[item.tone];
          return (
            <div
              key={item.id}
              role={item.tone === "error" ? "alert" : "status"}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-3.5 shadow-xl transition-all",
                borderColors[item.tone],
              )}
            >
              <Icon aria-hidden className={cn("mt-0.5 size-5 shrink-0", iconColors[item.tone])} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-primary">{item.title}</p>
                {item.message ? <p className="mt-0.5 text-xs text-muted leading-relaxed">{item.message}</p> : null}
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Dismiss notification"
                className="-mr-1 -mt-1 size-8 min-h-0 min-w-0 shrink-0 text-muted hover:text-primary"
                onClick={() => dismiss(item.id)}
              >
                <X aria-hidden className="size-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
