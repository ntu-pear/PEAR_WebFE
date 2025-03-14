import { useModal } from "@/hooks/useModal";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { FilePenLine } from "lucide-react";
import { DataTableClient } from "../Table/DataTable";
import { mockStaffAllocation } from "@/mocks/mockPatientDetails";

const StaffAllocationCard: React.FC = () => {
  const { openModal } = useModal();

  const staffAllocationColumns = [
    { key: "staffRole", header: "Staff Role" },
    { key: "staffName", header: "Staff Name" },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Staff Allocation</span>
            <Button
              size="sm"
              className="h-8 w-24 gap-1"
              onClick={() => openModal("editStaffAllocation")}
            >
              <FilePenLine className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Edit
              </span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTableClient
            data={mockStaffAllocation}
            columns={staffAllocationColumns}
            viewMore={false}
            hideActionsHeader={true}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default StaffAllocationCard;
