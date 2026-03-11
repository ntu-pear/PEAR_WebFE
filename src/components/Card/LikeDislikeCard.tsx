import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DataTableServer } from "../Table/DataTable";
import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { useModal } from "@/hooks/useModal";
import { useAuth } from "@/hooks/useAuth";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { useEffect, useState } from "react";
import { EditPersonalPreference, getPatientPersonalPreference, PersonalPreferenceTD, PersonalPreferenceTDServer } from "@/api/patients/personalPreference";
import { toast } from "sonner";

const LikeDislikeCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const { id, patientAllocation } = useViewPatient();
  const [likesDislikes, setLikesDislikes] = useState<PersonalPreferenceTDServer>({
    personalPreference: [],
    pagination: {
      pageNo: 0,
      pageSize: 5,
      totalRecords: 0,
      totalPages: 0,
    }
  })
  const personalPreferenceColumns = [
    { key: "PreferenceName", header: "Preference Name" },
    {
      key: "IsLike",
      header: "Like/Dislike",
      render: (row: string) => {
        const isLike = row === "Y"
        return(
          <span style={{color:isLike?"green":"red"}}>
            {isLike?"LIKE":"DISLIKE"}
          </span>
        )
      }
    },
    { key: "PerferenceRemarks", header: "Remarks" },
  ];

  const fetchPersonalPreference = async (pageNo: number = 0,
    pageSize: number) => {
    try {
      const response: PersonalPreferenceTDServer = await getPatientPersonalPreference(Number(id), pageNo, pageSize || 10, "LikesDislikes")
      setLikesDislikes(response)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to fetch patient Likes/Dislikes. ${error}`)
      } else {
        toast.error("Failed to fetch patient Likes/Dislikes.")
      }
      console.error("Failed to fetch patient Likes/Dislikes")
    }

  }

  useEffect(() => {
    fetchPersonalPreference(likesDislikes.pagination.pageNo, likesDislikes.pagination.pageSize)
  }, [id])

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
                PreferenceName:personalPreference.PreferenceName,
                IsLike: personalPreference.IsLike,
                PreferenceRemarks: personalPreference.PerferenceRemarks
              }
              openModal("editLikeDislike", {
                editPreference: editPreference,
                refreshData: fetchPersonalPreference,
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Likes/Dislikes</span>
            {(currentUser?.roleName === "SUPERVISOR" || patientAllocation?.guardianApplicationUserId === currentUser?.userId) && (
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() => openModal("addLikeDislike", { refreshData: fetchPersonalPreference })}
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
            data={likesDislikes.personalPreference}
            pagination={likesDislikes.pagination}
            fetchData={fetchPersonalPreference}
            columns={personalPreferenceColumns}
            viewMore={false}
            hideActionsHeader={currentUser?.roleName !== "SUPERVISOR" && patientAllocation?.guardianApplicationUserId !== currentUser?.userId}
            renderActions={renderAction}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default LikeDislikeCard;
