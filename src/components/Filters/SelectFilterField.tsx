import React from "react";
import { LucideIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FilterOption = {
  value: string;
  label: string;
};

type SelectFilterFieldProps = {
  label: string;
  icon?: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
};

const SelectFilterField: React.FC<SelectFilterFieldProps> = ({
  label,
  icon: Icon,
  value,
  onChange,
  options,
  placeholder,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-1">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder || label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SelectFilterField;