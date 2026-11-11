import * as React from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center rounded-2xl border border-border bg-white p-6 text-center shadow-sm sm:p-10", className)}>
      <div className="mb-4 rounded-full bg-soft-blue p-3.5 text-secondary border border-[#D5DFEB]">
        <Inbox aria-hidden className="size-6 text-secondary" />
      </div>
      <h3 className="font-serif text-lg font-semibold text-primary sm:text-xl">{title}</h3>
      {description ? <p className="mt-1.5 max-w-md text-sm text-muted leading-relaxed">{description}</p> : null}
      {action ? <div className="mt-5 w-full max-w-xs">{action}</div> : null}
    </div>
  );
}
