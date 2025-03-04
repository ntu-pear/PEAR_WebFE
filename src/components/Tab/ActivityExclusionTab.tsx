import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TabsContent } from "../ui/tabs";
import { DataTableClient } from "../Table/DataTable";
import { mockActivityExclusion } from "@/mocks/mockPatientDetails";
import TabProps from "./types";
import { useModal } from "@/hooks/useModal";
import AddActivityExclusionModal from "../Modal/AddActivityExclusionModal";

const ActivityExclusionTab: React.FC<TabProps> = () => {
  const { activeModal, openModal } = useModal();
  const activityExclusionColumns = [
    { key: "title", header: "Title" },
    { key: "description", header: "Description" },
    { key: "startDate", header: "Start Date" },
    { key: "endDate", header: "End Date" },
    { key: "remark", header: "Remark" },
  ];

  return (
    <>
      <TabsContent value="activity-exclusion">
        <Card className="my-2">
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
      </TabsContent>
      {activeModal.name == "addActivityExclusion" && (
        <AddActivityExclusionModal />
      )}
    </>
  );
};

export default ActivityExclusionTab;
