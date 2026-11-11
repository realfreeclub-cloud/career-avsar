import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { CAREER_AVSAR_BRAND } from "@/lib/brand/config";

export interface BrandLogoProps {
  variant?: "primary" | "horizontal" | "icon" | "white";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  showText?: boolean;
  href?: string;
  className?: string;
  priority?: boolean;
}

const SIZE_MAP = {
  xs: { img: 28, text: "text-sm", sub: "text-[9px]" },
  sm: { img: 36, text: "text-base", sub: "text-[10px]" },
  md: { img: 44, text: "text-lg", sub: "text-[11px]" },
  lg: { img: 56, text: "text-xl", sub: "text-xs" },
  xl: { img: 72, text: "text-2xl", sub: "text-sm" },
};

export function BrandLogo({
  variant = "primary",
  size = "md",
  showTagline = true,
  showText = true,
  href = "/",
  className,
  priority = false,
}: BrandLogoProps) {
  const s = SIZE_MAP[size];

  const content = (
    <div className={cn("group inline-flex items-center gap-3 select-none", className)}>
      {/* Official 3D Delta Arrow / Paper-Plane Symbol */}
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm transition-transform duration-200 group-hover:scale-105",
          variant === "white" && "border-white/20 bg-white/10 backdrop-blur-md",
        )}
        style={{ width: s.img, height: s.img }}
      >
        <Image
          src="/brand/career-avsar-logo.png"
          alt={CAREER_AVSAR_BRAND.brandName}
          width={s.img * 2}
          height={s.img * 2}
          priority={priority}
          className="size-full object-contain p-0.5"
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "block font-bold tracking-tight leading-none uppercase",
                s.text,
                variant === "white" ? "text-white" : "text-[#14264D]",
              )}
              style={{ letterSpacing: "0.03em" }}
            >
              Career <span className="text-[#1266C5]">Avsar</span>
            </span>
          </div>
          {showTagline && (
            <p
              className={cn(
                "hidden truncate font-medium leading-tight sm:block mt-0.5",
                s.sub,
                variant === "white" ? "text-white/80" : "text-[#F28B19]",
              )}
            >
              {CAREER_AVSAR_BRAND.tagline}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1266C5]"
        aria-label={`${CAREER_AVSAR_BRAND.brandName} – ${CAREER_AVSAR_BRAND.tagline}`}
      >
        {content}
      </Link>
    );
  }

  return content;
}
