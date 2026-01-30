import { useModal } from "@/hooks/useModal";
// import { mockRoutine } from "@/mocks/mockPatientDetails";
import { PlusCircle } from "lucide-react";
import { DataTableClient } from "../Table/DataTable";
import { CardHeader, CardTitle, CardContent, Card } from "../ui/card";
import { Button } from "../ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { useEffect, useState } from "react";
import { fetchPatientRoutine, RoutinesTD } from "@/api/activity/routine";

const RoutineCard: React.FC = () => {
  const { openModal } = useModal();
  const { currentUser } = useAuth();
  const { id } = useViewPatient();
  const routineColumns = [
    { key: "name", header: "Activity Name" },
    { key: "day_of_week", header: "Day" },
    { key: "time_slot", header: "Routine Time Slots" },
    { key: "start_date", header: "Start Date" },
    { key: "end_date", header: "End Date" }
  ];
  const [patientRoutine, setPatientRoutine] = useState<RoutinesTD[]>([])

  const handleFetchRoutine = async () => {
    const routine = await fetchPatientRoutine(Number(id))
    setPatientRoutine(routine)
  }
  useEffect(() => {
    refreshRoutineData()
  }, [])

  const refreshRoutineData = async () => {
    handleFetchRoutine()
  }

  const renderActions = (item: RoutinesTD) => {
    return (
      <div className="flex space-x-2 w-[75px] sm:w-[150px]">
        <Button
          variant="destructive"
          size="sm"
          className="mt-3"
          onClick={() =>
            openModal("deleteRoutine", {
              routineId: item.id,
              refreshRoutineData,
            })
          }
        >
          Delete
        </Button>
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Routine</span>
            {(currentUser?.roleName !== "GUARDIAN") && (
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() => openModal("addRoutine" ,{ refreshRoutineData })}
              >
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add
                </span>
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTableClient
            data={patientRoutine}
            columns={routineColumns}
            viewMore={false}
            renderActions={renderActions}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default RoutineCard;
