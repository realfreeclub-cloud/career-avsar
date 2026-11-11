import * as React from "react";
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

  return (
    <div
      className={cn("fixed inset-0 z-50 lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close navigation"
        tabIndex={open ? 0 : -1}
        className={cn(
          "absolute inset-0 bg-primary/25 backdrop-blur-[3px] transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "absolute top-0 flex h-full w-[min(22rem,92vw)] max-w-full flex-col bg-white p-5 shadow-2xl transition-transform duration-250 ease-out",
          side === "left" ? "left-0 border-r border-border" : "right-0 border-l border-border",
          open ? "translate-x-0" : side === "left" ? "-translate-x-full" : "translate-x-full",
          className,
        )}
      >
        <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
          <h2 id={titleId} className="font-serif text-lg font-semibold text-primary">
            {title}
          </h2>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose} className="text-primary hover:bg-soft-blue">
            <X aria-hidden />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
