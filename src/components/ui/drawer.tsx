"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  side?: "left" | "right";
  className?: string;
};

export function Drawer({ open, onClose, title, children, side = "left", className }: DrawerProps) {
  const titleId = React.useId();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const content = (
    <div
      className={cn(
        "fixed inset-0 z-[100] lg:hidden transition-all duration-300",
        open ? "pointer-events-auto visible" : "pointer-events-none invisible",
      )}
      aria-hidden={!open}
    >
      {/* Dark backdrop overlay over full screen */}
      <button
        type="button"
        aria-label="Close navigation"
        tabIndex={open ? 0 : -1}
        className={cn(
          "absolute inset-0 bg-[#14264D]/60 backdrop-blur-xs transition-opacity duration-300 ease-out",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />

      {/* Drawer slide-in panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "absolute top-0 flex h-full max-h-screen w-[min(22rem,88vw)] max-w-full flex-col bg-white p-5 shadow-2xl transition-transform duration-300 ease-out",
          side === "left" ? "left-0 border-r border-slate-200" : "right-0 border-l border-slate-200",
          open ? "translate-x-0" : side === "left" ? "-translate-x-full" : "translate-x-full",
          className,
        )}
      >
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 id={titleId} className="font-serif text-lg font-bold text-[#14264D]">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close navigation"
            onClick={onClose}
            className="size-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="size-5" aria-hidden />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">{children}</div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
