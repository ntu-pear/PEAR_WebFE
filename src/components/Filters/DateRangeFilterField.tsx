import React from "react";
import { Input } from "@/components/ui/input";
import { LucideIcon } from "lucide-react";

type DateRangeFilterFieldProps = {
  label: string;
  icon?: LucideIcon;
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
};

const DateRangeFilterField: React.FC<DateRangeFilterFieldProps> = ({
  label,
  icon: Icon,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-1">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </label>
      <Input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
      />
      <Input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
      />
    </div>
  );
};

export default DateRangeFilterField;