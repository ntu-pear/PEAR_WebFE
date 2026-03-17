import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type FilterExportButtonsProps = {
  onInternalExport: () => void;
  onExternalExport: () => void;
  internalLabel?: string;
  externalLabel?: string;
};

const FilterExportButtons: React.FC<FilterExportButtonsProps> = ({
  onInternalExport,
  onExternalExport,
  internalLabel = "Internal (Full)",
  externalLabel = "External (Anon)",
}) => {
  return (
    <>
      <label className="text-sm font-medium">Export</label>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={onInternalExport}
      >
        <Download className="h-4 w-4 mr-2" />
        {internalLabel}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={onExternalExport}
      >
        <Download className="h-4 w-4 mr-2" />
        {externalLabel}
      </Button>
    </>
  );
};

export default FilterExportButtons;