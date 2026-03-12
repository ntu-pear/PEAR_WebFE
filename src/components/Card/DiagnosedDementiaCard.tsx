import {
  DiagnosedDementiaTD,
  fetchDiagnosedDementia,
} from "@/api/patients/diagnosedDementia";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { useEffect, useMemo, useState } from "react";
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
    useState<DiagnosedDementiaTD[]>([]);
  const [pageNo, setPageNo] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const handleFetchDiagnosedDementia = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const response: DiagnosedDementiaTD[] = await fetchDiagnosedDementia(
        Number(id),
      );
      setDiagnosedDementiaTDServer(response);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch patient diagnosed dementia");
    }
  };

  useEffect(() => {
    handleFetchDiagnosedDementia();
  }, [id]);

  const pagedDementias = useMemo(() => {
    const start = pageNo * pageSize
    return diagnosedDementiaTDServer.slice(start, start + pageSize)
  }, [diagnosedDementiaTDServer, pageNo, pageSize])

  const pagination = useMemo(() => ({
    pageNo,
    pageSize,
    totalRecords: diagnosedDementiaTDServer.length,
    totalPages: Math.ceil(diagnosedDementiaTDServer.length / pageSize)
  }), [diagnosedDementiaTDServer, pageNo, pageSize])

  // ✅ Called by DataTableServer — updates state only, no API call
  const handleFetchData = (newPageNo: number, newPageSize: number) => {
    setPageNo(newPageNo)
    setPageSize(newPageSize)
  }

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
                refreshData: () => {
                  const isLastItemOnPage = pagedDementias.length === 1 && pageNo > 0
                  if (isLastItemOnPage) setPageNo(p => p - 1)
                  handleFetchDiagnosedDementia()
                },
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
            data={pagedDementias}
            pagination={pagination}
            columns={dementiaColumns}
            viewMore={false}
            renderActions={renderActions}
            hideActionsHeader={currentUser?.roleName !== "DOCTOR"}
            fetchData={handleFetchData}
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
