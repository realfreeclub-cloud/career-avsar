import * as React from "react";
import { cn } from "@/lib/utils/cn";

type CardProps<T extends React.ElementType = "div"> = {
  as?: T;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className">;

export function Card<T extends React.ElementType = "div">({ as, className, ...props }: CardProps<T>) {
  const Comp = as ?? "div";
  return (
    <Comp
      className={cn(
        "rounded-xl border border-border bg-surface p-4 shadow-[0_2px_8px_-2px_rgba(20,35,59,0.05),0_1px_3px_rgba(20,35,59,0.03)] transition-all duration-200 hover:border-[#D5CFBF] sm:p-6",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 space-y-1.5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-serif text-lg font-semibold tracking-tight text-primary sm:text-xl", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted leading-relaxed", className)} {...props} />;
}
