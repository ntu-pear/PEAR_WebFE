import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useModal } from "@/hooks/useModal";
import { useAuth } from "@/hooks/useAuth";
import {
  AllergyTD,
  AllergyTDServer,
  fetchPatientAllergy,
} from "@/api/patients/allergy";
import { PlusCircle } from "lucide-react";
import { DataTableServer } from "../Table/DataTable";

const AllergyCard: React.FC = () => {
  const { id } = useViewPatient();
  const [allergyTDServer, setAllergyTDServer] = useState<AllergyTDServer>({
    allergies: [],
    pagination: {
      pageNo: 0,
      pageSize: 0,
      totalRecords: 0,
      totalPages: 0,
    },
  });
  const { openModal } = useModal();
  const { currentUser } = useAuth();

  const handleFetchAllergy = async (pageNo: number) => {
    if (!id || isNaN(Number(id))) return;
    try {
      const fetchedAllergyTDServer: AllergyTDServer = await fetchPatientAllergy(
        Number(id),
        pageNo
      );

      setAllergyTDServer(fetchedAllergyTDServer);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch allergy for patient");
    }
  };

  useEffect(() => {
    console.log("patientId", id);
    refreshAllergyData();
  }, []);

  const refreshAllergyData = () => {
    handleFetchAllergy(allergyTDServer.pagination.pageNo || 0);
  };

  const allergyColumns = [
    { key: "allergicTo", header: "Allergic To", width: "15%" },
    { key: "reaction", header: "Reaction", width: "15%" },
    { key: "notes", header: "Notes", width: "50%" },
  ];

  const renderActions = (item: AllergyTD) => {
    return (
      currentUser?.roleName === "SUPERVISOR" && (
        <div className="flex space-x-2 w-[75px] sm:w-[150px]">
          <Button
            size="sm"
            className="mt-3"
            onClick={() =>
              openModal("editAllergy", {
                allergyId: item.id,
                patientId: id,
                refreshAllergyData,
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
              openModal("deleteAllergy", {
                allergyId: item.id,
                refreshAllergyData,
              })
            }
          >
            Delete
          </Button>
        </div>
      )
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Allergy</span>
            {currentUser?.roleName === "SUPERVISOR" && (
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() =>
                  openModal("addAllergy", {
                    patientId: id,
                    submitterId: currentUser?.userId,
                    refreshAllergyData,
                  })
                }
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
            data={allergyTDServer.allergies}
            pagination={allergyTDServer.pagination}
            columns={allergyColumns}
            viewMore={false}
            renderActions={renderActions}
            hideActionsHeader={currentUser?.roleName !== "SUPERVISOR"}
            fetchData={handleFetchAllergy}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default AllergyCard;
