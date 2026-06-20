"use client";

import { cn } from "@/lib/utils";

export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizeClass: Record<LogoSize, string> = {
  xs: "h-5",   // 20px
  sm: "h-7",   // 28px
  md: "h-8",   // 32px
  lg: "h-11",  // 44px
  xl: "h-16",  // 64px
};

interface Props {
  size?: LogoSize;
  className?: string;
}

export function AppLogo({ size = "md", className }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="MauriRide"
      className={cn("w-auto block", sizeClass[size], className)}
    />
  );
}

export function AppLogoIcon({ size = "sm", className }: Props) {
  return <AppLogo size={size} className={className} />;
}

export function AppLogoBrand({ size = "md", className }: Props) {
  return (
    <div className={cn("bg-white rounded-xl p-1.5 shadow-md inline-flex flex-shrink-0", className)}>
      <AppLogo size={size} />
    </div>
  );
}
