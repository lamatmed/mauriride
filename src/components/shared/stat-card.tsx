import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconColor?: string;
  format?: "number" | "currency" | "raw";
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconColor = "bg-teal-100 text-teal-600",
  format = "number",
  className,
}: StatCardProps) {
  const displayValue =
    typeof value === "number"
      ? format === "currency"
        ? formatCurrency(value)
        : format === "number"
        ? formatNumber(value)
        : value.toString()
      : value;

  const isPositive = change !== undefined && change >= 0;

  return (
    <div className={cn("card-stat group", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-primary tracking-tight">
            {displayValue}
          </p>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1.5">
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  isPositive ? "text-emerald-600" : "text-red-600"
                )}
              >
                {isPositive ? "+" : ""}
                {change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-muted-foreground">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className={cn("card-stat-icon flex-shrink-0 ml-4", iconColor)}>
          {icon}
        </div>
      </div>
    </div>
  );
}
