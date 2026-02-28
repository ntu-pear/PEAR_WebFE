import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DataTableServer } from "../Table/DataTable";
import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { useModal } from "@/hooks/useModal";
import { useAuth } from "@/hooks/useAuth";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { useEffect, useState } from "react";
import { getPatientPersonalPreference, PersonalPreferenceTDServer } from "@/api/patients/personalPreference";

const LikeDislikeCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const { id, patientAllocation } = useViewPatient();
  const [likes, setLikes] = useState<PersonalPreferenceTDServer>({
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
    { key: "PerferenceRemarks", header: "Remarks" },
    {
      key: "IsLike",
      header: "Like/Dislike",
      render: (row: string) => {
        return row === "Y" ? "LIKES" : "DISLIKES";
      }
    }
  ];

  const fetchPersonalPreference = async (pageNo: number = 0,
    pageSize: number) => {
    const response: PersonalPreferenceTDServer = await getPatientPersonalPreference(Number(id), pageNo, pageSize || 10, "LikesDislikes")
    setLikes(response)
  }

  useEffect(() => {
    fetchPersonalPreference(likes.pagination.pageNo, likes.pagination.pageSize)
  }, [id])

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
                onClick={() => openModal("addLike")}
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
            data={likes.personalPreference}
            pagination={likes.pagination}
            fetchData={fetchPersonalPreference}
            columns={personalPreferenceColumns}
            viewMore={false}
            hideActionsHeader={currentUser?.roleName !== "SUPERVISOR" && patientAllocation?.guardianApplicationUserId !== currentUser?.userId}
          // renderActions={}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default LikeDislikeCard;
