import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function Modal({ open, onClose, title, description, children, className }: ModalProps) {
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-primary/30 backdrop-blur-[3px] transition-opacity"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-10 max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl border border-border bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6",
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3 border-b border-border/60 pb-3">
          <div className="min-w-0">
            <h2 id={titleId} className="font-serif text-xl font-semibold text-primary">
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose} className="-mr-2 -mt-1 shrink-0 text-primary hover:bg-soft-blue">
            <X aria-hidden />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
