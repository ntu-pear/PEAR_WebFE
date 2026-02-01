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
import RoutineExclusionTable from "../Table/RoutineExclusionTable";

const RoutineCard: React.FC = () => {
  const { openModal } = useModal();
  const { currentUser } = useAuth();
  const { id } = useViewPatient();
  const routineColumns = [
    { key: "name", header: "Activity Name" },
    { key: "day_of_week", header: "Day" },
    { key: "time_slot", header: "Routine Time Slot" },
    { key: "start_date", header: "Start Date" },
    { key: "end_date", header: "End Date" },
  ];
  const [patientRoutine, setPatientRoutine] = useState<RoutinesTD[]>([])

  const handleFetchRoutine = async () => {
    try {
      const routine = await fetchPatientRoutine(Number(id))
      setPatientRoutine(routine)
    } catch (error) {
      console.log("No routines found for patient or error fetching:", error)
      setPatientRoutine([])
    }
  }
  useEffect(() => {
    refreshRoutineData()
  }, [])

  const refreshRoutineData = async () => {
    await handleFetchRoutine()
  }

  const renderActions = (item: RoutinesTD) => {
    return (
      <div className="flex space-x-2 w-[75px] sm:w-[150px]">
        <Button
          size="sm"
          className="mt-3"
          onClick={() =>
            openModal("editRoutine", {
              routine: item,
              refreshRoutineData,
            })
          }
        >
          Edit
        </Button>
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

  const renderExpandedContent = (routine: RoutinesTD) => {
    return (<RoutineExclusionTable routine_id={Number(routine.id)} routine_startDate={String(routine.start_date)} routine_endDate={String(routine.end_date)}/>)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Routine</span>
            {(currentUser?.roleName === "SUPERVISOR") && (
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() => openModal("addRoutine", { refreshRoutineData })}
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
            expandable={true}
            renderExpandedContent={renderExpandedContent}

          />
        </CardContent>
      </Card>
    </>
  );
};

export default RoutineCard;
