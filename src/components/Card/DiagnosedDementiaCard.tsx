import { fetchDiagnosedDementia } from "@/api/patients/diagnosedDementia";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import {
  DiagnosedDementiaTD,
  mockDiagnosedDementiaList,
} from "@/mocks/mockPatientDetails";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DataTableClient } from "../Table/DataTable";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/hooks/useModal";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";

const DiagnosedDementiaCard: React.FC = () => {
  const { id } = useViewPatient();
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const [diagnosedDementia, setDiagnosedDementia] = useState<
    DiagnosedDementiaTD[]
  >([]);

  const handleFetchDiagnosedDementia = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const fetchedDiagnosedDementia: DiagnosedDementiaTD[] =
        import.meta.env.MODE === "development" ||
        import.meta.env.MODE === "production"
          ? await fetchDiagnosedDementia(Number(id))
          : mockDiagnosedDementiaList;
      setDiagnosedDementia(fetchedDiagnosedDementia);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch patient diagnosed dementia");
    }
  };

  useEffect(() => {
    handleFetchDiagnosedDementia();
  }, []);

  const dementiaColumns = [
    { key: "dementiaType", header: "Dementia Type" },
    { key: "dementiaDate", header: "Dementia Date" },
  ];

  const renderActions = (item: DiagnosedDementiaTD) => {
    return (
      currentUser?.roleName === "DOCTOR" && (
        <div className="flex space-x-2 w-[75px] sm:w-[150px]">
          <Button
            variant="destructive"
            size="sm"
            className="mt-3"
            onClick={() =>
              openModal("deleteDiagnosedDementia", {
                dementiaId: item.id,
                refreshData: handleFetchDiagnosedDementia,
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
            <span>Diagonosed Dementia</span>
            {currentUser?.roleName === "DOCTOR" && (
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() =>
                  openModal("addDiagnosedDementia", {
                    patientId: String(id),
                    submitterId: currentUser?.userId,
                    refreshData: handleFetchDiagnosedDementia,
                  })
                }
              >
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Assign
                </span>
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTableClient
            data={diagnosedDementia}
            columns={dementiaColumns}
            viewMore={false}
            renderActions={renderActions}
            hideActionsHeader={currentUser?.roleName !== "DOCTOR"}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default DiagnosedDementiaCard;
