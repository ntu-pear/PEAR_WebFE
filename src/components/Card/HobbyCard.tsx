import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DataTableServer } from "../Table/DataTable";
import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { useModal } from "@/hooks/useModal";
import { useAuth } from "@/hooks/useAuth";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { EditPersonalPreference, getPatientPersonalPreference, PersonalPreferenceTD } from "@/api/patients/personalPreference";
import { useEffect, useMemo, useState } from "react";


const HobbyCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const { id, patientAllocation } = useViewPatient();
  const [hobbies, setHobbies] = useState<PersonalPreferenceTD[]>([])
  const [pageNo, setPageNo] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const personalPreferenceColumns = [
    { key: "PreferenceName", header: "Hobby Name" },
    { key: "PerferenceRemarks", header: "Remarks" },
  ];

  const fetchPersonalPreference = async () => {
    const response: PersonalPreferenceTD[] = await getPatientPersonalPreference(Number(id), "Hobby")
    setHobbies(response)
  }

  useEffect(() => {
    fetchPersonalPreference()
  }, [])

  const paginatedhobbies = useMemo(() => {
    const start = pageNo * pageSize
    return hobbies.slice(start, start + pageSize)
  }, [pageNo, pageSize, hobbies])

  const pagination = useMemo(() => ({
    pageNo,
    pageSize,
    totalRecords: hobbies.length,
    totalPages: Math.ceil(hobbies.length / pageSize)
  }), [hobbies, pageSize, pageNo])

  const handleFetchData = (newPageNo: number, newPageSize: number) => {
    setPageNo(newPageNo)
    setPageSize(newPageSize)
  }

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
                refreshData: () => {fetchPersonalPreference()}
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
                  const isLastItemOnPage = paginatedhobbies.length === 1 && pageNo > 0
                  if (isLastItemOnPage) setPageNo(p => p - 1)
                  fetchPersonalPreference()
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
                  refreshData: () => {fetchPersonalPreference()}
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
            data={paginatedhobbies}
            columns={personalPreferenceColumns}
            pagination={pagination}
            viewMore={false}
            hideActionsHeader={currentUser?.roleName !== "SUPERVISOR" && patientAllocation?.guardianApplicationUserId !== currentUser?.userId}
            fetchData={handleFetchData}
            renderActions={renderAction}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default HobbyCard;
