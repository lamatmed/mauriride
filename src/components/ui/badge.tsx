import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:     "bg-primary text-white",
        teal:        "bg-teal-100 text-teal-700",
        success:     "bg-emerald-100 text-emerald-700",
        warning:     "bg-amber-100 text-amber-700",
        destructive: "bg-red-100 text-red-700",
        info:        "bg-blue-100 text-blue-700",
        secondary:   "bg-secondary text-secondary-foreground",
        outline:     "border border-border text-foreground",
        neutral:     "bg-slate-100 text-slate-600",
      },
    },
    defaultVariants: { variant: "teal" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            variant === "success"     && "bg-emerald-500",
            variant === "warning"     && "bg-amber-500",
            variant === "destructive" && "bg-red-500",
            variant === "info"        && "bg-blue-500",
            variant === "teal"        && "bg-teal-500",
            variant === "default"     && "bg-white",
            variant === "neutral"     && "bg-slate-400",
          )}
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
