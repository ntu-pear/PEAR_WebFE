import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DataTableServer } from "../Table/DataTable";
import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { useModal } from "@/hooks/useModal";
import { useAuth } from "@/hooks/useAuth";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { EditPersonalPreference, getPatientPersonalPreference, PersonalPreferenceTD, PersonalPreferenceTDServer } from "@/api/patients/personalPreference";
import { useEffect, useState } from "react";


const HobbyCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const { id, patientAllocation } = useViewPatient();
  const [hobbies, setHobbies] = useState<PersonalPreferenceTDServer>({
    personalPreference: [],
    pagination: {
      pageNo: 0,
      pageSize: 10,
      totalRecords: 0,
      totalPages: 0,
    }
  })
  const personalPreferenceColumns = [
    { key: "PreferenceName", header: "Hobby Name" },
    { key: "PerferenceRemarks", header: "Remarks" },
  ];

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
      (currentUser?.roleName === "SUPERVISOR" || patientAllocation?.guardianApplicationUserId === currentUser?.userId) && (
        <div className="flex space-x-2">
          <Button
            size="sm"
            className="mt-3"
            onClick={() => {
              const editPreference: EditPersonalPreference = {
                PatientID: Number(id),
                id: Number(personalPreference.id),
                PersonalPreferenceListID: Number(personalPreference.PersonalPreferenceListID),
                PreferenceName: personalPreference.PreferenceName,
                IsLike: personalPreference.IsLike,
                PreferenceRemarks: personalPreference.PerferenceRemarks
              }
              openModal("editHobby", {
                editPreference: editPreference,
                refreshData: () => fetchPersonalPreference(hobbies.pagination.pageNo || 0, hobbies.pagination.pageSize || 10)
              })
            }}
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
                refreshData: () => {
                  const isLastItemOnPage =
                    hobbies.personalPreference.length === 1 &&
                    hobbies.pagination.pageNo > 0;
                  fetchPersonalPreference(
                    isLastItemOnPage ? hobbies.pagination.pageNo - 1 : hobbies.pagination.pageNo || 0,
                    hobbies.pagination.pageSize || 10
                  );
                }
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
                onClick={() => openModal("addHobby", {
                  refreshData: () => fetchPersonalPreference(hobbies.pagination.pageNo || 0, hobbies.pagination.pageSize || 10)
                })}
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
