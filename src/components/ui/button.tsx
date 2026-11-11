import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "touch-target inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "relative overflow-hidden bg-primary text-white shadow-[0_2px_8px_rgba(20,35,59,0.18)] hover:bg-secondary hover:shadow-[0_4px_16px_rgba(20,35,59,0.24)] active:scale-[0.99] border border-primary/20",
        secondary:
          "bg-soft-blue text-primary border border-[#D5DFEB] hover:bg-[#DDE7F2] hover:border-[#C3D2E2] active:scale-[0.99]",
        outline:
          "border border-border bg-white text-primary shadow-sm hover:bg-[#F8F7F3] hover:border-accent active:scale-[0.99]",
        ghost:
          "text-primary hover:bg-soft-blue/70 hover:text-primary active:scale-[0.99]",
        gold:
          "bg-accent text-white shadow-[0_2px_10px_rgba(198,166,107,0.3)] hover:bg-[#B39358] active:scale-[0.99] border border-accent/20",
        danger:
          "bg-danger text-white shadow-sm hover:bg-red-700 active:scale-[0.99]",
      },
      size: {
        sm: "min-h-[44px] px-3.5 text-sm",
        md: "min-h-[44px] px-4.5 text-sm",
        lg: "min-h-[48px] px-6 text-base font-medium",
        icon: "size-11 p-0",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChildLink?: false;
}

export interface LinkButtonProps extends VariantProps<typeof buttonVariants> {
  asChildLink: true;
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  "aria-label"?: string;
}

type Props = ButtonProps | LinkButtonProps;

export const Button = React.forwardRef<HTMLButtonElement, Props>(function Button(props, ref) {
  if ("asChildLink" in props && props.asChildLink) {
    const { href, className, variant, size, fullWidth, children, onClick, ...rest } = props;
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        aria-label={rest["aria-label"]}
      >
        {children}
      </Link>
    );
  }
  const { className, variant, size, fullWidth, type = "button", ...rest } = props as ButtonProps;
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...rest}
    />
  );
});

export { buttonVariants };
