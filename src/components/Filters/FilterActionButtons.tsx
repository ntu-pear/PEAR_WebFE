import React from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

type FilterActionButtonsProps = {
  onApply: () => void;
  onReset: () => void;
  applyLabel?: string;
  resetLabel?: string;
  applyIcon?: LucideIcon;
};

const FilterActionButtons: React.FC<FilterActionButtonsProps> = ({
  onApply,
  onReset,
  applyLabel = "Apply Filters",
  resetLabel = "Reset",
  applyIcon: ApplyIcon,
}) => {
  return (
    <div className="pt-2 space-y-2">
      <Button className="w-full" onClick={onApply}>
        {ApplyIcon && <ApplyIcon className="h-4 w-4 mr-2" />}
        {applyLabel}
      </Button>
      <Button variant="outline" className="w-full" onClick={onReset}>
        {resetLabel}
      </Button>
    </div>
  );
};

export default FilterActionButtons;