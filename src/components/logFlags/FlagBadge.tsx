import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { LogFlag, LogFlagCode, LogFlagSeverity } from "@/types/logFlags";

export const FLAG_LABELS: Record<LogFlagCode, string> = {
  failed_login_burst: "Failed-login burst",
  bulk_delete: "Bulk delete",
  off_hours: "Off-hours",
  mass_access: "Mass access",
  sensitive_change: "Sensitive change",
  error_spike: "Error spike",
};

// Tinted, outlined chips so they sit quietly beside the solid action/level badges.
// Critical uses the destructive theme token; warning uses amber like the existing level badges.
const SEVERITY_CLASS: Record<LogFlagSeverity, string> = {
  warning:
    "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300",
  critical:
    "border-destructive/40 bg-destructive/10 text-destructive dark:border-destructive/50 dark:bg-destructive/15",
};

export const FlagBadge: React.FC<{ flag: LogFlag; className?: string }> = ({ flag, className }) => {
  const label = FLAG_LABELS[flag.code] ?? flag.code;
  const severity: LogFlagSeverity = flag.severity === "critical" ? "critical" : "warning";
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            aria-label={`${label}: ${flag.reason}`}
            data-severity={severity}
            className={cn(
              "inline-flex cursor-default items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              SEVERITY_CLASS[severity],
              className
            )}
          >
            {label}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs">{flag.reason}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/** Renders nothing when a row has no flags, so unflagged rows are unchanged. */
export const FlagBadges: React.FC<{ flags?: LogFlag[] | null }> = ({ flags }) => {
  if (!flags || flags.length === 0) return null;
  return (
    <>
      {flags.map((flag, index) => (
        <FlagBadge key={`${flag.code}-${index}`} flag={flag} />
      ))}
    </>
  );
};