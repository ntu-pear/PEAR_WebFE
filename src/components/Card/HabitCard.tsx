import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DataTableServer } from "../Table/DataTable";
import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { personalPreferenceColumns } from "../Tab/PersonalPreferenceTab";
import { useModal } from "@/hooks/useModal";
import { useAuth } from "@/hooks/useAuth";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { getPatientPersonalPreference, PersonalPreferenceTDServer } from "@/api/patients/personalPreference";
import { useEffect, useState } from "react";

const HabitCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const { id, patientAllocation } = useViewPatient()
  const [habits, setHabits] = useState<PersonalPreferenceTDServer>({
    personalPreference: [],
    pagination: {
      pageNo: 0,
      pageSize: 5,
      totalRecords: 0,
      totalPages: 0,
    }
  })

  const fetchPersonalPreference = async (
    pageNo: number = 0,
    pageSize: number) => {
    const response: PersonalPreferenceTDServer = await getPatientPersonalPreference(Number(id), pageNo, pageSize||10, "Habit")
    setHabits(response)
  }

  useEffect(() => {
    fetchPersonalPreference(habits.pagination.pageNo, habits.pagination.pageSize)
  },[id])

  return (
    <>
      <Card className="my-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Habits</span>
            {(currentUser?.roleName === "SUPERVISOR" || patientAllocation?.guardianApplicationUserId
            ) && (
                <Button
                  size="sm"
                  className="h-8 w-24 gap-1"
                  onClick={() => openModal("addHabit")}
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
          <DataTableServer
            data={habits.personalPreference}
            pagination={habits.pagination}
            columns={personalPreferenceColumns}
            viewMore={false}
            hideActionsHeader={currentUser?.roleName !== "SUPERVISOR" && patientAllocation?.guardianApplicationUserId !== currentUser?.userId}
            fetchData={fetchPersonalPreference}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default HabitCard;
