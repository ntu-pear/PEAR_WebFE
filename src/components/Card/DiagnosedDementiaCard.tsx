import {
  DiagnosedDementiaTD,
  DiagnosedDementiaTDServer,
  fetchDiagnosedDementia,
} from "@/api/patients/diagnosedDementia";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DataTableServer } from "../Table/DataTable";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/hooks/useModal";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";

const DiagnosedDementiaCard: React.FC = () => {
  const { id } = useViewPatient();
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const [diagnosedDementiaTDServer, setDiagnosedDementiaTDServer] =
    useState<DiagnosedDementiaTDServer>({
      diagnosedDementias: [],
      pagination: {
        pageNo: 0,
        pageSize: 0,
        totalRecords: 0,
        totalPages: 0,
      },
    });

  const handleFetchDiagnosedDementia = async (pageNo: number) => {
    if (!id || isNaN(Number(id))) return;
    try {
      const response: DiagnosedDementiaTDServer = await fetchDiagnosedDementia(
        Number(id),
        pageNo
      );
      setDiagnosedDementiaTDServer(response);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch patient diagnosed dementia");
    }
  };

  useEffect(() => {
    refreshDiagnosedDementiaData();
  }, []);

  const refreshDiagnosedDementiaData = () => {
    handleFetchDiagnosedDementia(
      diagnosedDementiaTDServer.pagination.pageNo || 0
    );
  };

  const dementiaColumns = [
    { key: "dementiaType", header: "Dementia Type" },
    { key: "dementia_stage_value", header: "Dementia Stage" },
    { key: "dementiaDate", header: "Dementia Date" },
  ];

  const renderActions = (item: DiagnosedDementiaTD) => {
    return (
      currentUser?.roleName === "DOCTOR" && (
        <div className="flex justify-center items-center gap-2">
          <Button
            size="sm"
            className=""
            onClick={() =>
              openModal("editDiagnosedDementia", {
                diagnosedDementia: item,
                submitterId: currentUser.userId,
                refreshData: handleFetchDiagnosedDementia,
              })
            }
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className=""
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
          <DataTableServer
            data={diagnosedDementiaTDServer.diagnosedDementias}
            pagination={diagnosedDementiaTDServer.pagination}
            columns={dementiaColumns}
            viewMore={false}
            renderActions={renderActions}
            hideActionsHeader={currentUser?.roleName !== "DOCTOR"}
            fetchData={handleFetchDiagnosedDementia}
            className={
              currentUser?.roleName === "DOCTOR"
                ? `w-full overflow-x-auto
                [&_th:first-child]:w-[40%]
                [&_th:nth-child(2)]:w-[30%]
                [&_th:nth-child(3)]:w-[20%]
                [&_th:last-child]:w-[10%]`
                : `w-full overflow-x-auto
                [&_th:first-child]:w-[33%]
                [&_th:nth-child(2)]:w-[33%]
                [&_th:last-child]:w-[34%]`
            }
          />
        </CardContent>
      </Card>
    </>
  );
};

export default DiagnosedDementiaCard;
