import { useModal } from "@/hooks/useModal";
import { mockRoutine } from "@/mocks/mockPatientDetails";
import { PlusCircle } from "lucide-react";
import { DataTableClient } from "../Table/DataTable";
import { CardHeader, CardTitle, CardContent, Card } from "../ui/card";
import { Button } from "../ui/button";
import { useAuth } from "@/hooks/useAuth";

const RoutineCard: React.FC = () => {
  const { openModal } = useModal();
  const { currentUser } = useAuth();
  const routineColumns = [
    { key: "activityName", header: "Activity Name" },
    { key: "routineIssue", header: "Routine Issue" },
    { key: "routineTimeSlots", header: "Routine Time Slots" },
    { key: "includeInSchedule", header: "Include in Schedule" },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Routine</span>
            {(currentUser?.roleName !== "GUARDIAN")&&(
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() => openModal("addRoutine")}
              >
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add
                </span>
              </Button>
            )}
            {/* <Button
              size="sm"
              className="h-8 w-24 gap-1"
              onClick={() => openModal("addRoutine")}
            >
              <PlusCircle className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add
              </span>
            </Button> */}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTableClient
            data={mockRoutine}
            columns={routineColumns}
            viewMore={false}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default RoutineCard;
