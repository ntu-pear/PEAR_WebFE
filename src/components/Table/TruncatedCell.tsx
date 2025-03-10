import type React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TruncatedCellProps {
  value: React.ReactNode;
  className?: string;
  maxTooltipWidth?: number;
}

const TruncatedCell: React.FC<TruncatedCellProps> = ({
  value,
  className,
  maxTooltipWidth = 300,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isSimpleValue = (val: any): boolean => {
    return (
      val !== null &&
      val !== undefined &&
      (typeof val === "string" ||
        typeof val === "number" ||
        typeof val === "boolean")
    );
  };

  const canShowTooltip = isSimpleValue(value);

  if (!canShowTooltip) {
    return <div className={className}>{value}</div>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/*Cell Value */}
          <div className={`truncate ${className || ""}`}>{value}</div>
        </TooltipTrigger>
        <TooltipContent
          //Tooltip Value
          className="max-w-xs"
          style={{
            maxWidth: `${maxTooltipWidth}px`,
            whiteSpace: "normal", // Allow text to wrap
            wordBreak: "break-word", // Break long words if necessary
          }}
        >
          <p>{String(value)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TruncatedCell;
