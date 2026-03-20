import React, { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Filter,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

type FilterSidebarProps = {
  title?: string;
  defaultCollapsed?: boolean;
  defaultVisible?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  headerActions?: ReactNode;
  widthClassName?: string;
};

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  title = "Filters",
  defaultCollapsed = false,
  defaultVisible = true,
  children,
  footer,
  headerActions,
  widthClassName = "w-72",
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [visible] = useState(defaultVisible);

  return (
    <div
      className={`${
        collapsed ? "w-16" : widthClassName
      } flex-shrink-0 transition-all duration-300`}
    >
      <div className="flex h-full flex-col bg-white">
        {collapsed ? (
          <div className="flex h-full flex-col items-center gap-3 p-3">
            <div className="flex h-10 w-10 items-center justify-center bg-emerald-50 text-emerald-600">
              <Filter className="h-5 w-5" />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(false)}
              className="h-10 w-10 text-slate-600 hover:bg-slate-100"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <>
            <div className="border-b px-4 py-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-emerald-50 text-emerald-600">
                    <Filter className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-slate-900">
                      {title}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-2">
                  {headerActions}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(true)}
                    className="h-9 w-9 text-slate-500 hover:bg-slate-100"
                  >
                    <PanelLeftClose className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {visible && (
                <div className="px-4 py-4">
                  <div className="space-y-5">{children}</div>
                </div>
              )}
            </div>

            {footer && (
              <div className="border-t bg-slate-50/70 px-4 py-4">
                <div className="space-y-2">{footer}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;