import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DataTableServer } from "../Table/DataTable";
import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { personalPreferenceColumns } from "../Tab/PersonalPreferenceTab";
import { useModal } from "@/hooks/useModal";
import { useAuth } from "@/hooks/useAuth";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { getPatientPersonalPreference, PersonalPreferenceTD, PersonalPreferenceTDServer } from "@/api/patients/personalPreference";
import { useEffect, useState } from "react";


const HobbyCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const { id, patientAllocation } = useViewPatient();
  const [hobbies, setHobbies] = useState<PersonalPreferenceTDServer>({
    personalPreference: [],
    pagination: {
      pageNo: 0,
      pageSize: 5,
      totalRecords: 0,
      totalPages: 0,
    }
  })

  const fetchPersonalPreference = async (pageNo: number = 0,
    pageSize: number) => {
    const response: PersonalPreferenceTDServer = await getPatientPersonalPreference(Number(id), pageNo, pageSize || 10, "Hobby")
    setHobbies(response)
  }

  useEffect(() => {
    fetchPersonalPreference(hobbies.pagination.pageNo, hobbies.pagination.pageSize)
  }, [])

  const renderAction = (personalPreference: PersonalPreferenceTD) => {
    return (
      (currentUser?.roleName === "SUPERVISOR") && (
        <div className="flex space-x-2">
          <Button
            size="sm"
            className="mt-3"
          // onClick={() =>
          //   openModal("editProblem", {
          //     problemLog: problemLog,
          //     refreshData: fetchProblemLog,
          //   })
          // }
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="mt-3"
            onClick={() =>
              openModal("deletePreference", {
                personalPreferenceId: personalPreference.id,
                refreshData: fetchPersonalPreference,
              })
            }
          >
            Delete
          </Button>
        </div>
      )
    )
  }

  return (
    <>
      <Card className="my-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Hobbies</span>
            {(currentUser?.roleName === "SUPERVISOR" || patientAllocation?.guardianApplicationUserId === currentUser?.userId) && (
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() => openModal("addHobby", { refreshData: fetchPersonalPreference })}
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
            data={hobbies.personalPreference}
            columns={personalPreferenceColumns}
            pagination={hobbies.pagination}
            viewMore={false}
            hideActionsHeader={currentUser?.roleName !== "SUPERVISOR" && patientAllocation?.guardianApplicationUserId !== currentUser?.userId}
            fetchData={fetchPersonalPreference}
            renderActions={renderAction}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default HobbyCard;
