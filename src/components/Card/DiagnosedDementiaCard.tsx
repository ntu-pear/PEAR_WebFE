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
    { key: "dementiaDate", header: "Dementia Date" },
  ];

  const renderActions = (item: DiagnosedDementiaTD) => {
    return (
      currentUser?.roleName === "DOCTOR" && (
        <div className="flex space-x-2 justify-center items-center">
          <Button
            variant="destructive"
            size="sm"
            className="mx-3 flex space-x-2"
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
                ? `
                  w-full max-w-full table-fixed overflow-x-auto overflow-y-hidden box-border p-6
                  [&_th:first-child]:w-[50%] [&_th:first-child]:
                  [&_td:first-child]:w-[50%] [&_td:first-child]:py-6
                  [&_th:nth-child(2)]:w-[25%] [&_th:nth-child(2)]:
                  [&_td:nth-child(2)]:w-[25%] [&_td:nth-child(2)]:py-6
                  [&_th:last-child]:w-[auto] 
                  [&_td:last-child]:flex [&_td:last-child]:justify-start [&_td:last-child]:items-center [&_td:last-child]:px-2 [&_td:last-child]:my-3 [&_td]:break-words [&_td]:whitespace-normal [&_td]:min-w-0 [&_td]:
                  [&_td]:max-h-[3rem] [&_td]:overflow-hidden
                `
                : `
                  w-full max-w-full table-auto overflow-x-auto overflow-y-hidden box-border
                  [&_th:first-child]:w-[75%] [&_td:first-child]:w-[75%] [&_td:first-child]:py-6
                  [&_th:last-child]:w-[25%] [&_td:last-child]:w-[25%] [&_td:last-child]:py-6
                  [&_th:last-child]:px-2 [&_th:last-child]:text-left [&_th:last-child]:min-w-0
                  [&_td:last-child]:px-2 [&_td:last-child]:text-left [&_td:last-child]:break-words [&_td:last-child]:whitespace-normal
                  [&_td]:max-h-[3rem] [&_td]:overflow-hidden
                `
            }
          />
        </CardContent>
      </Card>
    </>
  );
};

export default DiagnosedDementiaCard;
