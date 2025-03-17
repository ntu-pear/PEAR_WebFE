import { useModal } from "@/hooks/useModal";
import { mockActivityExclusion } from "@/mocks/mockPatientDetails";

import { PlusCircle } from "lucide-react";
import { DataTableClient } from "../Table/DataTable";
import { CardHeader, CardTitle, CardContent, Card } from "../ui/card";
import { Button } from "../ui/button";

const ActivityExclusionCard: React.FC = () => {
  const { openModal } = useModal();
  const activityExclusionColumns = [
    { key: "title", header: "Title" },
    { key: "description", header: "Description" },
    { key: "startDate", header: "Start Date" },
    { key: "endDate", header: "End Date" },
    { key: "remark", header: "Remark" },
  ];
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Activity Exclusion</span>
            <Button
              size="sm"
              className="h-8 w-24 gap-1"
              onClick={() => openModal("addActivityExclusion")}
            >
              <PlusCircle className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add
              </span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTableClient
            data={mockActivityExclusion}
            columns={activityExclusionColumns}
            viewMore={false}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default ActivityExclusionCard;
