import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn("flex flex-col items-center rounded-2xl border border-red-200 bg-red-50/40 p-6 text-center sm:p-8", className)}
    >
      <div className="mb-3 rounded-full bg-red-100 p-3 text-danger border border-red-200">
        <AlertTriangle aria-hidden className="size-6" />
      </div>
      <h3 className="font-serif text-base font-semibold text-primary">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted">{message}</p>
      {onRetry ? (
        <div className="mt-4">
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : null}
    </div>
  );
}
