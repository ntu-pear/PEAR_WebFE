import React from "react";
import { Input } from "@/components/ui/input";
import { LucideIcon } from "lucide-react";

type TextFilterFieldProps = {
  label: string;
  icon?: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
};

const TextFilterField: React.FC<TextFilterFieldProps> = ({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = "text",
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-1">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};

export default TextFilterField;