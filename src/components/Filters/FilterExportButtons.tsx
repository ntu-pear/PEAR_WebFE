import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type FilterExportButtonsProps = {
  onInternalExport: () => void | Promise<void>;
  onExternalExport?: () => void | Promise<void>;
  internalLabel?: string;
  externalLabel?: string;
};

const FilterExportButtons: React.FC<FilterExportButtonsProps> = ({
  onInternalExport,
  onExternalExport,
  internalLabel = "Export",
  externalLabel = "External (Anon)",
}) => {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-3">
        <label className="block text-sm font-semibold text-slate-900">
          Export
        </label>
        <p className="mt-1 text-xs text-slate-500">
          Download filtered results
        </p>
      </div>

      <div className="grid gap-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start rounded-xl"
          onClick={onInternalExport}
        >
          <Download className="mr-2 h-4 w-4" />
          {internalLabel}
        </Button>

        {onExternalExport && (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start rounded-xl"
            onClick={onExternalExport}
          >
            <Download className="mr-2 h-4 w-4" />
            {externalLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilterExportButtons;